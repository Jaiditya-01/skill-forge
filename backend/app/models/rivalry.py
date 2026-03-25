from beanie import Document, PydanticObjectId
from datetime import datetime
from pydantic import Field


class Rivalry(Document):
    user_id: PydanticObjectId
    rival_id: PydanticObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "rivalries"
