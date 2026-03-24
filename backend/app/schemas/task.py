from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreateRequest(BaseModel):
    title: str
    description: str = ""
    type: str = "Goal"  # "Milestone" or "Goal"
    due_date: Optional[datetime] = None
    xp_reward: int = 50


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # "Todo", "In Progress", "Done"
    type: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    status: str
    type: str
    due_date: Optional[datetime]
    xp_reward: int
    completed_at: Optional[datetime]
    created_at: datetime
