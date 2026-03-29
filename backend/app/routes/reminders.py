from fastapi import APIRouter, BackgroundTasks
from datetime import datetime, timedelta
from app.models.user import User, UserStats
from app.schemas.common import SuccessResponse
from app.services.email_service import send_reminder_email

router = APIRouter(prefix="/api", tags=["Reminders"])


@router.post("/trigger-reminders", response_model=SuccessResponse)
async def trigger_reminders(background_tasks: BackgroundTasks):
    """
    Send reminder emails to users inactive for 3+ days.
    Can be called by a cron job.
    """
    cutoff = datetime.utcnow() - timedelta(days=3)

    # Find users with last activity older than 3 days or no activity at all, that student can be removed from database
    inactive_stats = await UserStats.find(
        {"$or": [
            {"last_activity_date": {"$lt": cutoff}},
            {"last_activity_date": None},
        ]}
    ).to_list()

    sent_count = 0
    for stat in inactive_stats:
        user = await User.get(stat.user_id)
        if user and user.email:
            background_tasks.add_task(send_reminder_email, user.email, user.name)
            sent_count += 1

    return SuccessResponse(
        message=f"Queued {sent_count} reminder emails",
        data={"emails_queued": sent_count},
    )
