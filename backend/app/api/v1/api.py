from fastapi import APIRouter

from app.api.v1.endpoints import (
    cvs,
    educations,
    health,
    projects,
    skills,
    work_experiences,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(cvs.router, prefix="/cvs", tags=["cvs"])
api_router.include_router(
    work_experiences.router, prefix="/work-experiences", tags=["work-experiences"]
)
api_router.include_router(educations.router, prefix="/educations", tags=["educations"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
