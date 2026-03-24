from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.models.user import User, UserStats
from app.models.platform_metrics import PlatformMetrics
from app.models.skill import Skill
from app.models.badge import Badge
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user
from beanie import PydanticObjectId

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=SuccessResponse)
async def get_leaderboard(
    filter_type: Optional[str] = Query(None, description="Filter: university, nation, interest"),
    filter_value: Optional[str] = Query(None, description="Value for the filter"),
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
):
    """Get ranked leaderboard with optional filters."""
    # Build user query based on filter
    user_query = {}
    if filter_type == "university" and filter_value:
        user_query["university"] = filter_value
    elif filter_type == "nation" and filter_value:
        user_query["country"] = filter_value
    elif filter_type == "interest" and filter_value:
        user_query["interests"] = filter_value

    # Get filtered users
    if user_query:
        users = await User.find(user_query).to_list()
    else:
        users = await User.find_all().to_list()

    user_ids = [u.id for u in users]
    user_map = {u.id: u for u in users}

    # Get stats for these users
    all_stats = await UserStats.find({"user_id": {"$in": user_ids}}).to_list()
    stats_map = {s.user_id: s for s in all_stats}

    # Build leaderboard entries
    entries = []
    for uid in user_ids:
        user = user_map[uid]
        stats = stats_map.get(uid)
        entries.append({
            "user_id": str(uid),
            "name": user.name,
            "university": user.university,
            "country": user.country,
            "interests": user.interests,
            "total_xp": stats.total_xp if stats else 0,
            "current_level": stats.current_level if stats else 1,
            "current_streak": stats.current_streak if stats else 0,
        })

    # Sort by XP descending
    entries.sort(key=lambda x: x["total_xp"], reverse=True)

    # Add rank
    for i, entry in enumerate(entries[:limit]):
        entry["rank"] = i + 1

    return SuccessResponse(data=entries[:limit])


@router.get("/user/{user_id}", response_model=SuccessResponse)
async def get_peer_profile(
    user_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a read-only view of another user's profile for comparison."""
    peer = await User.get(PydanticObjectId(user_id))
    if not peer:
        return SuccessResponse(success=False, message="User not found")

    stats = await UserStats.find_one(UserStats.user_id == peer.id)
    skills = await Skill.find(Skill.user_id == peer.id).to_list()
    badges = await Badge.find(Badge.user_id == peer.id).to_list()
    latest_metrics = await PlatformMetrics.find(
        PlatformMetrics.user_id == peer.id
    ).sort("-date").first_or_none()

    return SuccessResponse(data={
        "user": {
            "id": str(peer.id),
            "name": peer.name,
            "university": peer.university,
            "major_semester": peer.major_semester,
            "interests": peer.interests,
            "country": peer.country,
        },
        "stats": {
            "total_xp": stats.total_xp if stats else 0,
            "current_level": stats.current_level if stats else 1,
            "current_streak": stats.current_streak if stats else 0,
            "longest_streak": stats.longest_streak if stats else 0,
        },
        "skills": [
            {
                "skill_name": s.skill_name,
                "category": s.category.value,
                "proficiency_score": s.proficiency_score,
            }
            for s in skills
        ],
        "badges": [
            {
                "badge_name": b.badge_name,
                "icon": b.icon,
                "date_earned": b.date_earned.isoformat(),
            }
            for b in badges
        ],
        "metrics": {
            "github_repos": latest_metrics.github_repos if latest_metrics else 0,
            "github_commits": latest_metrics.github_commits if latest_metrics else 0,
            "leetcode_solved": latest_metrics.leetcode_solved if latest_metrics else 0,
            "codeforces_solved": latest_metrics.codeforces_solved if latest_metrics else 0,
            "codechef_solved": latest_metrics.codechef_solved if latest_metrics else 0,
        },
    })
