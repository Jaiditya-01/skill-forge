from fastapi import APIRouter, Depends
from app.models.user import User
from app.models.skill_profile import SkillProfile
from app.schemas.skill_profile import SkillProfileUpdateRequest
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/skills-profile", tags=["Skill Profile"])


@router.get("", response_model=SuccessResponse)
async def get_skill_profile(current_user: User = Depends(get_current_user)):
    """Fetch the current user's structured skill profile."""
    profile = await SkillProfile.find_one(SkillProfile.user_id == current_user.id)
    if not profile:
        profile = SkillProfile(user_id=current_user.id)
        await profile.insert()

    return SuccessResponse(data={
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "dsa_topics": profile.dsa_topics,
        "programming_languages": profile.programming_languages,
        "frameworks": profile.frameworks,
        "tools": profile.tools,
        "soft_skills": profile.soft_skills,
        "project_experience": profile.project_experience,
        "interview_preparedness": profile.interview_preparedness,
    })


@router.put("", response_model=SuccessResponse)
async def update_skill_profile(
    req: SkillProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """Update array-based skill elements."""
    profile = await SkillProfile.find_one(SkillProfile.user_id == current_user.id)
    if not profile:
        profile = SkillProfile(user_id=current_user.id)
        await profile.insert()

    if req.dsa_topics is not None:
        profile.dsa_topics = req.dsa_topics
    if req.programming_languages is not None:
        profile.programming_languages = req.programming_languages
    if req.frameworks is not None:
        profile.frameworks = req.frameworks
    if req.tools is not None:
        profile.tools = req.tools
    if req.soft_skills is not None:
        profile.soft_skills = req.soft_skills
    if req.project_experience is not None:
        profile.project_experience = req.project_experience
    if req.interview_preparedness is not None:
        profile.interview_preparedness = req.interview_preparedness

    await profile.save()

    return SuccessResponse(message="Skill Profile updated", data={
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "dsa_topics": profile.dsa_topics,
        "programming_languages": profile.programming_languages,
        "frameworks": profile.frameworks,
        "tools": profile.tools,
        "soft_skills": profile.soft_skills,
        "project_experience": profile.project_experience,
        "interview_preparedness": profile.interview_preparedness,
    })
