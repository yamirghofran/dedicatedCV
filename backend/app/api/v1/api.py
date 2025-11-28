from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    cvs,
    educations,
    health,
    projects,
    skills,
    work_experiences,
)

api_router = APIRouter()

# Authentication endpoints (no prefix, publicly accessible)
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Health check endpoint
api_router.include_router(health.router, tags=["health"])

# Protected CV endpoints (require authentication)
api_router.include_router(cvs.router, prefix="/cvs", tags=["cvs"])
api_router.include_router(
    work_experiences.router, prefix="/work-experiences", tags=["work-experiences"]
)
api_router.include_router(educations.router, prefix="/educations", tags=["educations"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
