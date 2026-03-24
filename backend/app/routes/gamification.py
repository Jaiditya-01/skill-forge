from fastapi import APIRouter, Depends
from app.models.user import User, UserStats
from app.models.badge import Badge
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/gamification", tags=["Gamification"])


@router.get("/stats", response_model=SuccessResponse)
async def get_gamification_stats(current_user: User = Depends(get_current_user)):
    """Get current user's gamification stats."""
    stats = await UserStats.find_one(UserStats.user_id == current_user.id)
    badges = await Badge.find(Badge.user_id == current_user.id).to_list()

    return SuccessResponse(data={
        "stats": {
            "total_xp": stats.total_xp if stats else 0,
            "current_level": stats.current_level if stats else 1,
            "current_streak": stats.current_streak if stats else 0,
            "longest_streak": stats.longest_streak if stats else 0,
            "xp_to_next_level": 500 - ((stats.total_xp if stats else 0) % 500),
        },
        "badges": [
            {
                "id": str(b.id),
                "badge_name": b.badge_name,
                "description": b.description,
                "icon": b.icon,
                "date_earned": b.date_earned.isoformat(),
            }
            for b in badges
        ],
    })
