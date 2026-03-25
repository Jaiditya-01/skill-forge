from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime


class PlatformMetrics(Document):
    user_id: PydanticObjectId
    date: datetime = Field(default_factory=datetime.utcnow)
    # GitHub
    github_repos: int = 0
    github_commits: int = 0
    github_contributions: int = 0
    github_languages: dict = Field(default_factory=dict)
    # LeetCode
    leetcode_solved: int = 0
    leetcode_easy: int = 0
    leetcode_medium: int = 0
    leetcode_hard: int = 0
    leetcode_rating: float = 0
    # Codeforces
    codeforces_solved: int = 0
    codeforces_rating: int = 0
    # CodeChef
    codechef_solved: int = 0
    codechef_rating: int = 0

    class Settings:
        name = "platform_metrics"
