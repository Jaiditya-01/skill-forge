from fastapi import APIRouter, Depends
from app.models.user import User, UserProfile
from app.models.platform_metrics import PlatformMetrics
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user
from app.services.platform_service import (
    fetch_github_stats,
    fetch_leetcode_stats,
    fetch_codeforces_stats
)
from app.services.gamification_service import award_xp, calculate_xp_from_sync

router = APIRouter(prefix="/api/sync", tags=["Sync"])


@router.post("/sync-profiles", response_model=SuccessResponse)
async def sync_profiles(current_user: User = Depends(get_current_user)):
    """Fetch latest stats from all connected platforms and save a snapshot."""
    profile = await UserProfile.find_one(UserProfile.user_id == current_user.id)
    if not profile:
        return SuccessResponse(message="No profile found. Set platform usernames first.", data={})

    # Get old metrics for XP delta calculation
    old_metrics_doc = await PlatformMetrics.find(
        PlatformMetrics.user_id == current_user.id
    ).sort("-date").first_or_none()

    old_metrics = {}
    if old_metrics_doc:
        old_metrics = {
            "leetcode_solved": old_metrics_doc.leetcode_solved,
            "codeforces_solved": old_metrics_doc.codeforces_solved
        }

    # Fetch from all platforms
    github = await fetch_github_stats(profile.github_username)
    leetcode = await fetch_leetcode_stats(profile.leetcode_username)
    codeforces = await fetch_codeforces_stats(profile.codeforces_username)

    # Save new snapshot
    metrics = PlatformMetrics(
        user_id=current_user.id,
        github_repos=github["repos"],
        github_commits=github["commits"],
        github_contributions=github.get("contributions", 0),
        github_languages=github.get("languages", {}),
        github_daily=github.get("daily", {}),
        leetcode_solved=leetcode["solved"],
        leetcode_easy=leetcode["easy"],
        leetcode_medium=leetcode["medium"],
        leetcode_hard=leetcode["hard"],
        leetcode_rating=leetcode["rating"],
        leetcode_daily=leetcode.get("daily", {}),
        codeforces_solved=codeforces["solved"],
        codeforces_rating=codeforces["rating"],
        codeforces_daily=codeforces.get("daily", {}),
        codeforces_problem_ratings=codeforces.get("problem_ratings", {})
    )
    await metrics.insert()

    # Calculate and award XP from new problems solved
    new_metrics = {
        "leetcode_solved": leetcode["solved"],
        "codeforces_solved": codeforces["solved"]
    }
    xp_earned = await calculate_xp_from_sync(current_user.id, new_metrics, old_metrics)
    stats = None
    if xp_earned > 0:
        stats = await award_xp(current_user.id, xp_earned)

    return SuccessResponse(
        message=f"Profiles synced! {'+' + str(xp_earned) + ' XP' if xp_earned > 0 else 'No new XP'}",
        data={
            "github": github,
            "leetcode": leetcode,
            "codeforces": codeforces,
            "xp_earned": xp_earned,
            "stats": {
                "total_xp": stats.total_xp if stats else (old_metrics.get("total_xp", 0)),
                "current_level": stats.current_level if stats else 1,
            } if stats else None,
        },
    )


@router.get("/metrics", response_model=SuccessResponse)
async def get_metrics(
    days: int = 30,
    current_user: User = Depends(get_current_user),
):
    """Get platform metrics history for the last N days."""
    metrics = await PlatformMetrics.find(
        PlatformMetrics.user_id == current_user.id
    ).sort("-date").limit(days).to_list()

    return SuccessResponse(data=[
        {
            "date": m.date.isoformat(),
            "github_repos": m.github_repos,
            "github_commits": m.github_commits,
            "github_contributions": m.github_contributions,
            "github_languages": m.github_languages,
            "leetcode_solved": m.leetcode_solved,
            "leetcode_easy": m.leetcode_easy,
            "leetcode_medium": m.leetcode_medium,
            "leetcode_hard": m.leetcode_hard,
            "leetcode_rating": m.leetcode_rating,
            "codeforces_solved": m.codeforces_solved,
            "codeforces_rating": m.codeforces_rating
        }
        for m in metrics
    ])


@router.get("/unified-metrics", response_model=SuccessResponse)
async def get_unified_metrics(
    days: int = 30,
    current_user: User = Depends(get_current_user),
):
    """Get unified platform metrics structure."""
    profile = await UserProfile.find_one(UserProfile.user_id == current_user.id)
    if not profile:
        return SuccessResponse(data=[])

    metrics = await PlatformMetrics.find(
        PlatformMetrics.user_id == current_user.id
    ).sort("date").limit(days).to_list()  # Sort ascending for chronological activity

    # If no metrics, return empty
    if not len(metrics):
        latest = None
    else:
        latest = metrics[-1]

    unified_data = []
    # Setup 30 day date window ending today
    from datetime import datetime, timedelta
    today = datetime.utcnow()
    date_strs = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        date_strs.append(d.strftime("%Y-%m-%d"))

    # 1. LeetCode
    lc_activity = []
    lc_daily = latest.leetcode_daily if latest else {}
    for d_str in date_strs:
        lc_activity.append({"date": d_str, "value": lc_daily.get(d_str, 0)})
        
    unified_data.append({
        "platform": "LeetCode",
        "username": profile.leetcode_username,
        "maxRating": latest.leetcode_rating if latest else 0,
        "problemsSolved": {
            "Easy": latest.leetcode_easy if latest else 0,
            "Medium": latest.leetcode_medium if latest else 0,
            "Hard": latest.leetcode_hard if latest else 0
        },
        "activity": lc_activity
    })

    # 2. Codeforces
    cf_activity = []
    cf_daily = latest.codeforces_daily if latest else {}
    for d_str in date_strs:
        cf_activity.append({"date": d_str, "value": cf_daily.get(d_str, 0)})
        
    unified_data.append({
        "platform": "Codeforces",
        "username": profile.codeforces_username,
        "maxRating": latest.codeforces_rating if latest else 0,
        "problemsSolved": latest.codeforces_problem_ratings if latest else {},
        "activity": cf_activity
    })

    # 3. GitHub
    gh_activity = []
    gh_daily = latest.github_daily if latest else {}
    for d_str in date_strs:
        gh_activity.append({"date": d_str, "value": gh_daily.get(d_str, 0)})

    unified_data.append({
        "platform": "GitHub",
        "username": profile.github_username,
        "maxRating": 0, # not applicable
        "problemsSolved": {
            "Contributions": latest.github_contributions if latest else 0 
        },
        "languages": latest.github_languages if latest else {},
        "activity": gh_activity
    })

    return SuccessResponse(data=unified_data)

