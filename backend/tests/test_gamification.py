"""Tests for gamification logic."""
import pytest
from app.services.gamification_service import award_xp
from app.services.auth_service import hash_password
from app.models.user import User, UserStats
from app.models.badge import Badge
from app.database import init_db
import os


@pytest.fixture(autouse=True)
async def setup_db():
    """Setup test database."""
    os.environ["DATABASE_NAME"] = "skillforge_test_gamification"
    await init_db()
    yield
    from motor.motor_asyncio import AsyncIOMotorClient
    from app.config import get_settings
    settings = get_settings()
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await client.drop_database("skillforge_test_gamification")


@pytest.mark.asyncio
async def test_xp_and_level():
    """Test XP award and level calculation."""
    user = User(
        name="Test",
        email="gamification@test.com",
        password_hash=hash_password("test"),
    )
    await user.insert()

    stats = UserStats(user_id=user.id)
    await stats.insert()

    # Award 250 XP
    result = await award_xp(user.id, 250)
    assert result.total_xp == 250
    assert result.current_level == 1  # 250/500 + 1 = 1

    # Award 300 more XP (total 550)
    result = await award_xp(user.id, 300)
    assert result.total_xp == 550
    assert result.current_level == 2  # 550/500 + 1 = 2

    # Check streak
    assert result.current_streak >= 1


@pytest.mark.asyncio
async def test_badge_first_blood():
    """Test First Blood badge is awarded after completing first task."""
    from app.models.task import Task, TaskStatus
    from datetime import datetime

    user = User(
        name="Badge Tester",
        email="badge@test.com",
        password_hash=hash_password("test"),
    )
    await user.insert()

    stats = UserStats(user_id=user.id)
    await stats.insert()

    # Create and complete a task
    task = Task(
        user_id=user.id,
        title="First Task",
        status=TaskStatus.DONE,
        completed_at=datetime.utcnow(),
    )
    await task.insert()

    # Award XP (triggers badge check)
    await award_xp(user.id, 50)

    # Check for First Blood badge
    badges = await Badge.find(Badge.user_id == user.id).to_list()
    badge_names = [b.badge_name for b in badges]
    assert "First Blood" in badge_names
