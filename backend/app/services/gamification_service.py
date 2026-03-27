from datetime import datetime, timedelta
from beanie import PydanticObjectId
from app.models.user import UserStats
from app.models.task import Task, TaskStatus
from app.models.badge import Badge
from app.models.platform_metrics import PlatformMetrics


async def award_xp(user_id: PydanticObjectId, xp_amount: int):
    """Award XP to a user and recalculate level."""
    stats = await UserStats.find_one(UserStats.user_id == user_id)
    if not stats:
        stats = UserStats(user_id=user_id)

    stats.total_xp += xp_amount
    stats.current_level = (stats.total_xp // 500) + 1

    # Update streak
    today = datetime.utcnow().date()
    if stats.last_activity_date:
        last_date = stats.last_activity_date.date()
        if last_date == today:
            pass  # Already active today, no streak change
        elif last_date == today - timedelta(days=1):
            stats.current_streak += 1
        else:
            stats.current_streak = 1
    else:
        stats.current_streak = 1

    stats.longest_streak = max(stats.longest_streak, stats.current_streak)
    stats.last_activity_date = datetime.utcnow()

    await stats.save()

    # Check and award badges
    await check_and_award_badges(user_id, stats)

    return stats


async def check_and_award_badges(user_id: PydanticObjectId, stats: UserStats):
    """Check conditions and award badges."""
    existing_badges = await Badge.find(Badge.user_id == user_id).to_list()
    earned_names = {b.badge_name for b in existing_badges}

    badges_to_check = [
        {
            "name": "First Blood",
            "description": "Completed your first task",
            "icon": "🩸",
            "condition": await _has_completed_tasks(user_id, 1),
        },
        {
            "name": "Task Master",
            "description": "Completed 10 tasks",
            "icon": "⚔️",
            "condition": await _has_completed_tasks(user_id, 10),
        },
        {
            "name": "Consistent Coder",
            "description": "Maintained a 7-day streak",
            "icon": "🔥",
            "condition": stats.longest_streak >= 7,
        },
        {
            "name": "Centurion",
            "description": "Solved 100 problems across platforms",
            "icon": "🏛️",
            "condition": await _total_problems_solved(user_id) >= 100,
        },
        {
            "name": "Level Up",
            "description": "Reached Level 5",
            "icon": "⬆️",
            "condition": stats.current_level >= 5,
        },
        {
            "name": "XP Hunter",
            "description": "Earned 1000 XP",
            "icon": "💎",
            "condition": stats.total_xp >= 1000,
        },
        {
            "name": "Streak Master",
            "description": "Maintained a 30-day streak",
            "icon": "🌟",
            "condition": stats.longest_streak >= 30,
        },
    ]

    for badge_info in badges_to_check:
        if badge_info["name"] not in earned_names and badge_info["condition"]:
            badge = Badge(
                user_id=user_id,
                badge_name=badge_info["name"],
                description=badge_info["description"],
                icon=badge_info["icon"],
            )
            await badge.insert()


async def _has_completed_tasks(user_id: PydanticObjectId, count: int) -> bool:
    completed = await Task.find(
        Task.user_id == user_id,
        Task.status == TaskStatus.DONE,
    ).count()
    return completed >= count


async def _total_problems_solved(user_id: PydanticObjectId) -> int:
    latest = await PlatformMetrics.find(
        PlatformMetrics.user_id == user_id
    ).sort("-date").first_or_none()
    if not latest:
        return 0
    return (
        latest.leetcode_solved
        + latest.codeforces_solved
    )


async def calculate_xp_from_sync(user_id: PydanticObjectId, new_metrics: dict, old_metrics: dict) -> int:
    """Calculate XP gained from platform sync deltas."""
    xp = 0
    for platform in ["leetcode_solved", "codeforces_solved"]:
        delta = new_metrics.get(platform, 0) - old_metrics.get(platform, 0)
        if delta > 0:
            xp += delta * 20  # 20 XP per new problem
    return xp
