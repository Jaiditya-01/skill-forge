from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime
from typing import Dict, Optional


class PlatformMetrics(Document):
    user_id: PydanticObjectId
    date: datetime = Field(default_factory=datetime.utcnow)
    # GitHub
    github_repos: int = 0
    github_commits: int = 0
    github_contributions: int = 0
    github_languages: dict = Field(default_factory=dict)
    github_daily: dict = Field(default_factory=dict)
    # LeetCode
    leetcode_solved: int = 0
    leetcode_easy: Optional[int] = 0
    leetcode_medium: Optional[int] = 0
    leetcode_hard: Optional[int] = 0
    leetcode_daily: Optional[Dict[str, int]] = Field(default_factory=dict)
    leetcode_rating: float = 0
    # Codeforces
    codeforces_rating: Optional[int] = 0
    codeforces_solved: Optional[int] = 0
    codeforces_daily: Optional[Dict[str, int]] = Field(default_factory=dict)
    codeforces_problem_ratings: Optional[Dict[str, int]] = Field(default_factory=dict)
    
    # CodeChef Metrics
    codechef_rating: Optional[int] = 0
    codechef_solved: Optional[int] = 0
    codechef_daily: Optional[Dict[str, int]] = Field(default_factory=dict)

    class Settings:
        name = "platform_metrics"
