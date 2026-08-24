"""
ResuMesh Admin Backend API Entrypoint
Independent Management & Admin Service
"""

import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config.database import Base, engine
from app.config.settings import settings
from app.routers import (
    admin,
    app_settings,
    articles,
    auth,
    avatar,
    certificates,
    cv,
    educations,
    experiences,
    packages,
    posts,
    projects,
    rxresume,
    search,
    sections,
    seo,
    skills,
    social_links,
    storage,
    videos,
)

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:
    logger.warning(f"Database table creation skipped/delayed: {exc}")

app = FastAPI(
    title="ResuMesh API",
    description="Intelligent Portfolio Admin Management Service",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
)

app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth.router)
api_v1_router.include_router(admin.router)
api_v1_router.include_router(projects.router)
api_v1_router.include_router(articles.router)
api_v1_router.include_router(educations.router)
api_v1_router.include_router(experiences.router)
api_v1_router.include_router(skills.router)
api_v1_router.include_router(certificates.router)
api_v1_router.include_router(packages.router)
api_v1_router.include_router(posts.router)
api_v1_router.include_router(videos.router)
api_v1_router.include_router(social_links.router)
api_v1_router.include_router(sections.router)
api_v1_router.include_router(app_settings.router)
api_v1_router.include_router(search.router)
api_v1_router.include_router(cv.router)
api_v1_router.include_router(avatar.router)
api_v1_router.include_router(storage.router)
api_v1_router.include_router(rxresume.router)
api_v1_router.include_router(seo.router)


@api_v1_router.get("/health")
@app.get("/health", include_in_schema=False)
async def admin_health():
    return {"status": "ok", "service": "resumesh-admin-backend", "version": "1.0.0"}


app.include_router(api_v1_router)
