from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    # Startup
    yield
    # Shutdown
    from app.core.database import engine
    await engine.dispose()


import os
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="DayFlow HRMS API – Every workday, perfectly aligned.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

os.makedirs("uploads/medical", exist_ok=True)
app.mount("/api/v1/static/medical", StaticFiles(directory="uploads/medical"), name="medical")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint – health check."""
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }
