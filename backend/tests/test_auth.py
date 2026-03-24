"""Tests for auth endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db

TEST_USER = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpassword123",
    "university": "MIT",
    "major_semester": "B.Tech CSE Semester VI",
    "interests": ["Backend", "DSA"],
    "country": "US",
}


@pytest.fixture(autouse=True)
async def setup_db():
    """Setup test database."""
    import os
    os.environ["DATABASE_NAME"] = "skillforge_test"
    await init_db()

    # Cleanup after test
    yield

    from motor.motor_asyncio import AsyncIOMotorClient
    from app.config import get_settings
    settings = get_settings()
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await client.drop_database("skillforge_test")


@pytest.mark.asyncio
async def test_register():
    """Test user registration."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/auth/register", json=TEST_USER)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "access_token" in data["data"]


@pytest.mark.asyncio
async def test_login():
    """Test user login."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register first
        await client.post("/api/auth/register", json=TEST_USER)

        # Login
        resp = await client.post("/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "access_token" in data["data"]


@pytest.mark.asyncio
async def test_get_me():
    """Test getting current user info."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register
        resp = await client.post("/api/auth/register", json=TEST_USER)
        token = resp.json()["data"]["access_token"]

        # Get me
        resp = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["data"]["user"]["email"] == TEST_USER["email"]
        assert data["data"]["stats"]["total_xp"] == 0


@pytest.mark.asyncio
async def test_unauthorized():
    """Test accessing protected route without token."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/auth/me")
        assert resp.status_code in [401, 403]
