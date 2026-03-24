from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    TODO = "Todo"
    IN_PROGRESS = "In Progress"
    DONE = "Done"


class TaskType(str, Enum):
    MILESTONE = "Milestone"
    GOAL = "Goal"


class Task(Document):
    user_id: PydanticObjectId
    title: str
    description: str = ""
    status: TaskStatus = TaskStatus.TODO
    type: TaskType = TaskType.GOAL
    due_date: Optional[datetime] = None
    xp_reward: int = 50
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tasks"
