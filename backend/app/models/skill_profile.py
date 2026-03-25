from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import List


class SkillProfile(Document):
    user_id: PydanticObjectId
    dsa_topics: List[str] = Field(default_factory=list)
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    project_experience: List[str] = Field(default_factory=list)
    interview_preparedness: str = "Beginner"

    class Settings:
        name = "skill_profiles"
