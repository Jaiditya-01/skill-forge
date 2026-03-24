from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime


class Badge(Document):
    user_id: PydanticObjectId
    badge_name: str
    description: str = ""
    icon: str = "🏆"
    date_earned: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "badges"
