from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.models.user import User, UserStats
from app.models.skill import Skill, SkillCategory
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/skills", tags=["Skills"])


class SkillCreateRequest(BaseModel):
    skill_name: str
    category: str = "DSA"  # "DSA" or "Project"
    proficiency_score: int = 1


class SkillUpdateRequest(BaseModel):
    proficiency_score: Optional[int] = None


@router.get("", response_model=SuccessResponse)
async def get_skills(current_user: User = Depends(get_current_user)):
    """Get all skills for the current user."""
    skills = await Skill.find(Skill.user_id == current_user.id).to_list()

    return SuccessResponse(data=[
        {
            "id": str(s.id),
            "skill_name": s.skill_name,
            "category": s.category.value,
            "proficiency_score": s.proficiency_score,
        }
        for s in skills
    ])


@router.post("", response_model=SuccessResponse)
async def add_skill(
    req: SkillCreateRequest,
    current_user: User = Depends(get_current_user),
):
    """Add a new skill."""
    existing = await Skill.find_one(
        Skill.user_id == current_user.id,
        Skill.skill_name == req.skill_name,
    )
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists")

    skill = Skill(
        user_id=current_user.id,
        skill_name=req.skill_name,
        category=SkillCategory(req.category),
        proficiency_score=req.proficiency_score,
    )
    await skill.insert()

    return SuccessResponse(message="Skill added", data={
        "id": str(skill.id),
        "skill_name": skill.skill_name,
        "category": skill.category.value,
        "proficiency_score": skill.proficiency_score,
    })


@router.put("/{skill_id}", response_model=SuccessResponse)
async def update_skill(
    skill_id: str,
    req: SkillUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """Update skill proficiency."""
    from beanie import PydanticObjectId
    skill = await Skill.get(PydanticObjectId(skill_id))
    if not skill or skill.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Skill not found")

    if req.proficiency_score is not None:
        skill.proficiency_score = max(1, min(100, req.proficiency_score))

    await skill.save()

    return SuccessResponse(message="Skill updated", data={
        "id": str(skill.id),
        "skill_name": skill.skill_name,
        "proficiency_score": skill.proficiency_score,
    })


@router.delete("/{skill_id}", response_model=SuccessResponse)
async def delete_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a skill."""
    from beanie import PydanticObjectId
    skill = await Skill.get(PydanticObjectId(skill_id))
    if not skill or skill.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Skill not found")

    await skill.delete()
    return SuccessResponse(message="Skill deleted")


@router.get("/recommend", response_model=SuccessResponse)
async def recommend_skills(current_user: User = Depends(get_current_user)):
    """
    Recommend missing skills based on what higher-level peers
    at the same university and with overlapping interests have.
    """
    # Get current user stats
    my_stats = await UserStats.find_one(UserStats.user_id == current_user.id)
    my_level = my_stats.current_level if my_stats else 1

    # Get my skills
    my_skills = await Skill.find(Skill.user_id == current_user.id).to_list()
    my_skill_names = {s.skill_name for s in my_skills}

    # Find peers: same university, overlapping interests, higher level
    peer_query = {}
    if current_user.university:
        peer_query["university"] = current_user.university

    potential_peers = await User.find(peer_query).to_list()

    # Filter peers by interests overlap and higher level
    peer_ids = []
    for peer in potential_peers:
        if peer.id == current_user.id:
            continue
        # Check interest overlap
        if current_user.interests and peer.interests:
            if not set(current_user.interests).intersection(set(peer.interests)):
                continue
        # Check higher level
        peer_stats = await UserStats.find_one(UserStats.user_id == peer.id)
        if peer_stats and peer_stats.current_level > my_level:
            peer_ids.append(peer.id)

    if not peer_ids:
        return SuccessResponse(
            message="No higher-level peers found for comparison",
            data={"recommended_skills": []},
        )

    # Get all skills from those peers
    peer_skills = await Skill.find({"user_id": {"$in": peer_ids}}).to_list()

    # Count skill frequency among peers (skills I don't have)
    skill_count = {}
    for s in peer_skills:
        if s.skill_name not in my_skill_names:
            if s.skill_name not in skill_count:
                skill_count[s.skill_name] = {
                    "count": 0,
                    "category": s.category.value,
                    "avg_proficiency": 0,
                    "total_proficiency": 0,
                }
            skill_count[s.skill_name]["count"] += 1
            skill_count[s.skill_name]["total_proficiency"] += s.proficiency_score

    # Calculate averages and sort by frequency
    recommendations = []
    for name, info in skill_count.items():
        info["avg_proficiency"] = round(info["total_proficiency"] / info["count"])
        recommendations.append({
            "skill_name": name,
            "category": info["category"],
            "peer_count": info["count"],
            "avg_proficiency": info["avg_proficiency"],
        })

    recommendations.sort(key=lambda x: x["peer_count"], reverse=True)

    return SuccessResponse(
        message=f"Found {len(recommendations)} recommended skills from {len(peer_ids)} higher-level peers",
        data={"recommended_skills": recommendations[:3]},
    )
