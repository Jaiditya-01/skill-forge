from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from datetime import datetime
from app.models.user import User
from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreateRequest, TaskUpdateRequest, TaskResponse
from app.schemas.common import SuccessResponse
from app.services.auth_service import get_current_user
from app.services.gamification_service import award_xp

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=SuccessResponse)
async def get_tasks(
    task_status: str = None,
    current_user: User = Depends(get_current_user),
):
    """Get all tasks for the current user, optionally filtered by status."""
    query = {"user_id": current_user.id}
    if task_status:
        query["status"] = task_status

    tasks = await Task.find(query).sort("-created_at").to_list()

    return SuccessResponse(data=[
        {
            "id": str(t.id),
            "user_id": str(t.user_id),
            "title": t.title,
            "description": t.description,
            "status": t.status.value,
            "type": t.type.value,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "xp_reward": t.xp_reward,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None,
            "created_at": t.created_at.isoformat(),
        }
        for t in tasks
    ])


@router.post("", response_model=SuccessResponse)
async def create_task(
    req: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
):
    """Create a new task."""
    task = Task(
        user_id=current_user.id,
        title=req.title,
        description=req.description,
        type=req.type,
        due_date=req.due_date,
        xp_reward=req.xp_reward,
    )
    await task.insert()

    return SuccessResponse(message="Task created", data={
        "id": str(task.id),
        "title": task.title,
        "status": task.status.value,
        "xp_reward": task.xp_reward,
    })


@router.put("/{task_id}", response_model=SuccessResponse)
async def update_task(
    task_id: str,
    req: TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """Update a task."""
    task = await Task.get(PydanticObjectId(task_id))
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    if req.title is not None:
        task.title = req.title
    if req.description is not None:
        task.description = req.description
    if req.status is not None:
        task.status = TaskStatus(req.status)
    if req.type is not None:
        task.type = req.type
    if req.due_date is not None:
        task.due_date = req.due_date

    await task.save()

    return SuccessResponse(message="Task updated", data={
        "id": str(task.id),
        "title": task.title,
        "status": task.status.value,
    })


@router.delete("/{task_id}", response_model=SuccessResponse)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a task."""
    task = await Task.get(PydanticObjectId(task_id))
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    await task.delete()
    return SuccessResponse(message="Task deleted")


@router.post("/{task_id}/complete", response_model=SuccessResponse)
async def complete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    """Complete a task and award XP."""
    task = await Task.get(PydanticObjectId(task_id))
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status == TaskStatus.DONE:
        raise HTTPException(status_code=400, detail="Task already completed")

    task.status = TaskStatus.DONE
    task.completed_at = datetime.utcnow()
    await task.save()

    # Award XP
    stats = await award_xp(current_user.id, task.xp_reward)

    return SuccessResponse(
        message=f"Task completed! +{task.xp_reward} XP",
        data={
            "task": {"id": str(task.id), "title": task.title, "xp_reward": task.xp_reward},
            "stats": {
                "total_xp": stats.total_xp,
                "current_level": stats.current_level,
                "current_streak": stats.current_streak,
            },
        },
    )
