from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import get_settings


async def init_db():
    """Initialize MongoDB connection and Beanie ODM."""
    settings = get_settings()
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.DATABASE_NAME]

    # Import all document models
    from app.models.user import User, UserProfile, UserStats
    from app.models.task import Task
    from app.models.platform_metrics import PlatformMetrics
    from app.models.skill import Skill
    from app.models.badge import Badge
    from app.models.skill_profile import SkillProfile
    from app.models.rivalry import Rivalry

    await init_beanie(
        database=database,
        document_models=[
            User,
            UserProfile,
            UserStats,
            Task,
            PlatformMetrics,
            Skill,
            Badge,
            SkillProfile,
            Rivalry,
        ],
    )
