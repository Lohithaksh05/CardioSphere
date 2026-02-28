"""
CardioSphere Backend — FastAPI application entry point.
Registers all routes, middleware, and lifecycle events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from database import connect_db, close_db
from services.ml_service import load_model

# Import route modules
from routes.auth import router as auth_router
from routes.prediction import router as prediction_router
from routes.ai_planner import router as ai_planner_router
from routes.medication import router as medication_router
from routes.dashboard import router as dashboard_router
from routes.community import router as community_router
from routes.hospitals import router as hospitals_router
from services.scheduler_service import scheduler, reschedule_all_on_startup

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    # Startup
    await connect_db()
    load_model()
    scheduler.start()
    from database import get_db
    await reschedule_all_on_startup(get_db())
    print("🚀 CardioSphere API is ready")
    yield
    # Shutdown
    scheduler.shutdown(wait=False)
    await close_db()


app = FastAPI(
    title="CardioSphere API",
    description="Heart disease risk prediction and health management platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers under /api/v1
PREFIX = "/api/v1"
app.include_router(auth_router, prefix=PREFIX)
app.include_router(prediction_router, prefix=PREFIX)
app.include_router(ai_planner_router, prefix=PREFIX)
app.include_router(medication_router, prefix=PREFIX)
app.include_router(dashboard_router, prefix=PREFIX)
app.include_router(community_router, prefix=PREFIX)
app.include_router(hospitals_router, prefix=PREFIX)


@app.get("/")
async def root():
    return {
        "app": "CardioSphere API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "ok",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
