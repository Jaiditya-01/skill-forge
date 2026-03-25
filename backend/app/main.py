from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(
    title="SkillForge API",
    description="Gamified competitive tracking for CS students",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow any localhost port so Vite's auto-increment ports (5173, 5174, …) always work
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc),
        },
    )


# Import and include routers
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.tasks import router as tasks_router
from app.routes.sync import router as sync_router
from app.routes.gamification import router as gamification_router
from app.routes.leaderboard import router as leaderboard_router
from app.routes.skills_profile import router as skills_profile_router
from app.routes.peer_comparison import router as peer_comparison_router
from app.routes.rivalry import router as rivalry_router
from app.routes.skills import router as skills_router
from app.routes.reminders import router as reminders_router

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(tasks_router)
app.include_router(sync_router)
app.include_router(gamification_router)
app.include_router(leaderboard_router)
app.include_router(skills_router)
app.include_router(reminders_router)
app.include_router(skills_profile_router)
app.include_router(peer_comparison_router)
app.include_router(rivalry_router)


@app.get("/api/health")
async def health_check():
    return {"success": True, "message": "SkillForge API is running 🚀"}
