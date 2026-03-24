from fastapi import APIRouter, HTTPException, status
from app.models.user import User, UserProfile, UserStats
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    UserUpdateRequest,
)
from app.schemas.common import SuccessResponse, ErrorResponse
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from fastapi import Depends

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=SuccessResponse)
async def register(req: RegisterRequest):
    """Register a new user."""
    existing = await User.find_one(User.email == req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        name=req.name,
        email=req.email,
        university=req.university,
        major_semester=req.major_semester,
        interests=req.interests,
        country=req.country,
        password_hash=hash_password(req.password),
    )
    await user.insert()

    # Create initial profile
    profile = UserProfile(user_id=user.id)
    await profile.insert()

    # Create initial stats
    stats = UserStats(user_id=user.id)
    await stats.insert()

    # Generate token
    token = create_access_token({"sub": str(user.id)})

    return SuccessResponse(
        message="Registration successful",
        data={
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
            },
            "access_token": token,
            "token_type": "bearer",
        },
    )


@router.post("/login", response_model=SuccessResponse)
async def login(req: LoginRequest):
    """Login and get access token."""
    user = await User.find_one(User.email == req.email)
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id)})

    return SuccessResponse(
        message="Login successful",
        data={
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
            },
            "access_token": token,
            "token_type": "bearer",
        },
    )


@router.get("/me", response_model=SuccessResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    stats = await UserStats.find_one(UserStats.user_id == current_user.id)
    profile = await UserProfile.find_one(UserProfile.user_id == current_user.id)

    return SuccessResponse(
        data={
            "user": {
                "id": str(current_user.id),
                "name": current_user.name,
                "email": current_user.email,
                "university": current_user.university,
                "major_semester": current_user.major_semester,
                "interests": current_user.interests,
                "country": current_user.country,
            },
            "stats": {
                "total_xp": stats.total_xp if stats else 0,
                "current_level": stats.current_level if stats else 1,
                "current_streak": stats.current_streak if stats else 0,
                "longest_streak": stats.longest_streak if stats else 0,
            },
            "profile": {
                "github_username": profile.github_username if profile else "",
                "leetcode_username": profile.leetcode_username if profile else "",
                "codeforces_username": profile.codeforces_username if profile else "",
                "codechef_username": profile.codechef_username if profile else "",
            },
        }
    )


@router.put("/me", response_model=SuccessResponse)
async def update_me(req: UserUpdateRequest, current_user: User = Depends(get_current_user)):
    """Update current user info."""
    if req.name is not None:
        current_user.name = req.name
    if req.university is not None:
        current_user.university = req.university
    if req.major_semester is not None:
        current_user.major_semester = req.major_semester
    if req.interests is not None:
        current_user.interests = req.interests
    if req.country is not None:
        current_user.country = req.country

    await current_user.save()

    return SuccessResponse(message="Profile updated", data={
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "university": current_user.university,
        "major_semester": current_user.major_semester,
        "interests": current_user.interests,
        "country": current_user.country,
    })
