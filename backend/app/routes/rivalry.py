from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId
from app.models.user import User
from app.models.rivalry import Rivalry
from app.models.platform_metrics import PlatformMetrics
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/rivalry", tags=["Rivalry"])


@router.post("/add/{rival_id}", response_model=SuccessResponse)
async def add_rival(rival_id: str, current_user: User = Depends(get_current_user)):
    if str(current_user.id) == rival_id:
        raise HTTPException(status_code=400, detail="You cannot rival yourself.")
    
    rival_user = await User.get(PydanticObjectId(rival_id))
    if not rival_user:
        raise HTTPException(status_code=404, detail="User not found.")

    existing = await Rivalry.find_one(
        Rivalry.user_id == current_user.id,
        Rivalry.rival_id == rival_user.id
    )
    if existing:
        return SuccessResponse(message="Already rivals.")

    rivalry = Rivalry(user_id=current_user.id, rival_id=rival_user.id)
    await rivalry.insert()
    return SuccessResponse(message=f"{rival_user.name} added as a rival!")


@router.delete("/remove/{rival_id}", response_model=SuccessResponse)
async def remove_rival(rival_id: str, current_user: User = Depends(get_current_user)):
    rivalry = await Rivalry.find_one(
        Rivalry.user_id == current_user.id,
        Rivalry.rival_id == PydanticObjectId(rival_id)
    )
    if not rivalry:
        raise HTTPException(status_code=404, detail="Rivalry not found.")

    await rivalry.delete()
    return SuccessResponse(message="Rival removed.")


@router.get("/search", response_model=SuccessResponse)
async def search_users(q: str, current_user: User = Depends(get_current_user)):
    """Search for any registered user by name to add as a rival."""
    if not q or not q.strip():
        return SuccessResponse(data={"users": []})
        
    # Case-insensitive regex search
    users = await User.find({"name": {"$regex": q.strip(), "$options": "i"}}).to_list()
    
    results = []
    for u in users:
        if u.id != current_user.id:
            # Optionally fetch the latest metrics to display XP in the search results
            metrics = await PlatformMetrics.find(PlatformMetrics.user_id == u.id).sort("-date").first_or_none()
            results.append({
                "user_id": str(u.id),
                "name": u.name,
                "total_xp": metrics.total_xp if metrics else 0
            })
            
    return SuccessResponse(data={"users": results})


@router.get("/dashboard", response_model=SuccessResponse)
async def get_rivalry_dashboard(current_user: User = Depends(get_current_user)):
    """Fetch metrics for current user and all rivals for side-by-side comparison."""
    rivalries = await Rivalry.find(Rivalry.user_id == current_user.id).to_list()
    rival_ids = [r.rival_id for r in rivalries]

    if not rival_ids:
        return SuccessResponse(data={"rivalries": []})

    # Fetch User docs for names/avatars
    rival_users = await User.find({"_id": {"$in": rival_ids}}).to_list()
    user_map = {str(u.id): u.name for u in rival_users}

    # Helper to get latest metrics for a user
    async def get_latest_metrics(uid):
        return await PlatformMetrics.find(PlatformMetrics.user_id == uid).sort("-date").first_or_none()

    my_metrics = await get_latest_metrics(current_user.id)
    
    my_stats = {
        "hard_solved": my_metrics.leetcode_hard if my_metrics else 0,
        "total_solved": (my_metrics.leetcode_solved + my_metrics.codeforces_solved) if my_metrics else 0,
        "github_commits": my_metrics.github_contributions if my_metrics else 0,
    }

    results = []
    for r_id in rival_ids:
        r_uid_str = str(r_id)
        r_metrics = await get_latest_metrics(r_id)
        r_stats = {
            "hard_solved": r_metrics.leetcode_hard if r_metrics else 0,
            "total_solved": (r_metrics.leetcode_solved + r_metrics.codeforces_solved) if r_metrics else 0,
            "github_commits": r_metrics.github_contributions if r_metrics else 0,
        }

        results.append({
            "rival_id": r_uid_str,
            "rival_name": user_map.get(r_uid_str, "Unknown"),
            "my_metrics": my_stats,
            "rival_metrics": r_stats,
            "winner": {
                "hard_solved": "you" if my_stats["hard_solved"] >= r_stats["hard_solved"] else "rival",
                "total_solved": "you" if my_stats["total_solved"] >= r_stats["total_solved"] else "rival",
                "github_commits": "you" if my_stats["github_commits"] >= r_stats["github_commits"] else "rival",
            }
        })

    return SuccessResponse(data={"rivalries": results})
