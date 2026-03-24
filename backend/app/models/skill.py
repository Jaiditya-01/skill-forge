from beanie import Document, PydanticObjectId
from enum import Enum


class SkillCategory(str, Enum):
    DSA = "DSA"
    PROJECT = "Project"


class Skill(Document):
    user_id: PydanticObjectId
    skill_name: str  # e.g. "React.js", "Dynamic Programming"
    category: SkillCategory = SkillCategory.DSA
    proficiency_score: int = 1  # 1-100

    class Settings:
        name = "skills"
