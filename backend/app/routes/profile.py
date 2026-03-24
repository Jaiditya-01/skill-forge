from fastapi import APIRouter, Depends
from app.models.user import User, UserProfile
from app.schemas.profile import ProfileUpdateRequest
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user

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
        "codeforces_username": profile.codeforces_username,
        "codechef_username": profile.codechef_username,
    })


@router.put("", response_model=SuccessResponse)
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """Update platform usernames."""
    profile = await UserProfile.find_one(UserProfile.user_id == current_user.id)
    if not profile:
        profile = UserProfile(user_id=current_user.id)

    if req.github_username is not None:
        profile.github_username = req.github_username
    if req.leetcode_username is not None:
        profile.leetcode_username = req.leetcode_username
    if req.codeforces_username is not None:
        profile.codeforces_username = req.codeforces_username
    if req.codechef_username is not None:
        profile.codechef_username = req.codechef_username

    await profile.save()

    return SuccessResponse(message="Profile updated", data={
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "github_username": profile.github_username,
        "leetcode_username": profile.leetcode_username,
        "codeforces_username": profile.codeforces_username,
        "codechef_username": profile.codechef_username,
    })
