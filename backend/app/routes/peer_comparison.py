from fastapi import APIRouter, Depends
from app.models.user import User, UserStats
from app.models.platform_metrics import PlatformMetrics
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/peer", tags=["Peer Comparison"])

@router.get("/compare", response_model=SuccessResponse)
async def get_peer_comparison(current_user: User = Depends(get_current_user)):
    """Fetch aggregated averages from peers with the same target role, year, and skill level."""
    
    # Base query for peers
    query = {}
    if current_user.target_role:
        query["target_role"] = current_user.target_role
    if current_user.year:
        query["year"] = current_user.year
    if current_user.skill_level:
        query["skill_level"] = current_user.skill_level

    # If the user hasn't set any profile fields, return empty comparison
    if not query:
        return SuccessResponse(data={"message": "Complete your profile to unlock peer comparison.", "has_data": False})

    peers = await User.find(query).to_list()
    peer_ids = [p.id for p in peers if p.id != current_user.id]

    if not peer_ids:
        return SuccessResponse(data={"message": "Not enough peers found in your exact demographic yet.", "has_data": False})

    # Get stats
    peer_stats = await UserStats.find({"user_id": {"$in": peer_ids}}).to_list()
    my_stats = await UserStats.find_one(UserStats.user_id == current_user.id)
    
    avg_xp = sum(s.total_xp for s in peer_stats) / len(peer_stats) if peer_stats else 0
    avg_streak = sum(s.current_streak for s in peer_stats) / len(peer_stats) if peer_stats else 0
    
    my_xp = my_stats.total_xp if my_stats else 0
    my_streak = my_stats.current_streak if my_stats else 0

    # Get metrics
    peer_metrics_docs = await PlatformMetrics.find({"user_id": {"$in": peer_ids}}).to_list()
    my_metrics = await PlatformMetrics.find({"user_id": current_user.id}).sort("-date").first_or_none()

    # We just want the latest metrics per peer to get "problems solved"
    peer_latest = {}
    for pm in peer_metrics_docs:
        pid = str(pm.user_id)
        if pid not in peer_latest or pm.date > peer_latest[pid].date:
            peer_latest[pid] = pm

    total_peer_solved = 0
    for pm in peer_latest.values():
        total_peer_solved += (pm.leetcode_solved + pm.codeforces_solved)
    
    avg_solved = total_peer_solved / len(peer_latest) if peer_latest else 0
    
    my_solved = 0
    if my_metrics:
        my_solved = my_metrics.leetcode_solved + my_metrics.codeforces_solved

    return SuccessResponse(data={
        "has_data": True,
        "peer_count": len(peer_ids),
        "demographic": f"{current_user.year} {current_user.target_role}",
        "metrics": {
            "xp": {
                "you": my_xp,
                "peer_avg": round(avg_xp),
                "is_higher": my_xp >= avg_xp
            },
            "streak": {
                "you": my_streak,
                "peer_avg": round(avg_streak),
                "is_higher": my_streak >= avg_streak
            },
            "problems_solved": {
                "you": my_solved,
                "peer_avg": round(avg_solved),
                "is_higher": my_solved >= avg_solved
            }
        }
    })
