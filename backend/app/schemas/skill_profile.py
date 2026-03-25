from pydantic import BaseModel
from typing import List, Optional


class SkillProfileUpdateRequest(BaseModel):
    dsa_topics: Optional[List[str]] = None
    programming_languages: Optional[List[str]] = None
    frameworks: Optional[List[str]] = None
    tools: Optional[List[str]] = None
    soft_skills: Optional[List[str]] = None
    project_experience: Optional[List[str]] = None
    interview_preparedness: Optional[str] = None
