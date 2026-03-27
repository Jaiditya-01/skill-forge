from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User, UserProfile
from app.schemas.profile import ProfileUpdateRequest
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user
from app.services.platform_service import (
    verify_github_user,
    verify_leetcode_user,
    verify_codeforces_user
)

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("", response_model=SuccessResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's platform profile (usernames)."""
    profile = await UserProfile.find_one(UserProfile.user_id == current_user.id)
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        await profile.insert()

    return SuccessResponse(data={
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "github_username": profile.github_username,
        "leetcode_username": profile.leetcode_username,
        "codeforces_username": profile.codeforces_username
    })


@router.put("", response_model=SuccessResponse)
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """Update platform usernames with validation and uniqueness checking."""
    profile = await UserProfile.find_one(UserProfile.user_id == current_user.id)
    if not profile:
        profile = UserProfile(user_id=current_user.id)

    # GitHub
    if req.github_username is not None and req.github_username != profile.github_username:
        if req.github_username != "":
            existing = await UserProfile.find_one({"github_username": req.github_username})
            if existing and existing.user_id != current_user.id:
                raise HTTPException(status_code=400, detail=f"GitHub username '{req.github_username}' is already linked to another account")
            is_valid = await verify_github_user(req.github_username)
            if not is_valid:
                raise HTTPException(status_code=400, detail=f"GitHub username '{req.github_username}' does not exist or failed verification")
        profile.github_username = req.github_username

    # LeetCode
    if req.leetcode_username is not None and req.leetcode_username != profile.leetcode_username:
        if req.leetcode_username != "":
            existing = await UserProfile.find_one({"leetcode_username": req.leetcode_username})
            if existing and existing.user_id != current_user.id:
                raise HTTPException(status_code=400, detail=f"LeetCode username '{req.leetcode_username}' is already linked to another account")
            is_valid = await verify_leetcode_user(req.leetcode_username)
            if not is_valid:
                raise HTTPException(status_code=400, detail=f"LeetCode username '{req.leetcode_username}' does not exist or failed verification")
        profile.leetcode_username = req.leetcode_username

    # Codeforces
    if req.codeforces_username is not None and req.codeforces_username != profile.codeforces_username:
        if req.codeforces_username != "":
            existing = await UserProfile.find_one({"codeforces_username": req.codeforces_username})
            if existing and existing.user_id != current_user.id:
                raise HTTPException(status_code=400, detail=f"Codeforces handle '{req.codeforces_username}' is already linked to another account")
            is_valid = await verify_codeforces_user(req.codeforces_username)
            if not is_valid:
                raise HTTPException(status_code=400, detail=f"Codeforces handle '{req.codeforces_username}' does not exist or failed verification")
        profile.codeforces_username = req.codeforces_username

    await profile.save()

    return SuccessResponse(message="Profile updated", data={
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "github_username": profile.github_username,
        "leetcode_username": profile.leetcode_username,
        "codeforces_username": profile.codeforces_username
    })
