from pydantic import BaseModel
from typing import Optional


class ProfileUpdateRequest(BaseModel):
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None
    codeforces_username: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    github_username: str
    leetcode_username: str
    codeforces_username: str
