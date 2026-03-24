from beanie import Document, PydanticObjectId
from pydantic import EmailStr, Field
from typing import List, Optional
from datetime import datetime


class User(Document):
    name: str
    email: EmailStr
    university: str = ""
    major_semester: str = ""  # e.g. "B.Tech CSE Semester VI"
    interests: List[str] = []  # e.g. ["Frontend", "Backend", "DSA"]
    country: str = ""
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


class UserProfile(Document):
    user_id: PydanticObjectId
    github_username: str = ""
    leetcode_username: str = ""
    codeforces_username: str = ""
    codechef_username: str = ""

    class Settings:
        name = "user_profiles"


class UserStats(Document):
    user_id: PydanticObjectId
    total_xp: int = 0
    current_level: int = 1
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[datetime] = None

    class Settings:
        name = "user_stats"
