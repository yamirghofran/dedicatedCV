from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.cv import CV
from app.models.project import Project
from app.models.user import User
from app.schemas.project import Project as ProjectSchema
from app.schemas.project import ProjectCreate, ProjectUpdate

router = APIRouter()


def verify_cv_ownership(cv_id: int, user_id: int, db: Session) -> CV:
    """Verify that the CV belongs to the user."""
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == user_id).first()
    if not cv:
        raise HTTPException(
            status_code=403,
            detail="CV not found or you don't have access to this CV",
        )
    return cv


@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new project entry (only for user's own CV)."""
    verify_cv_ownership(project_in.cv_id, current_user.id, db)

    project = Project(**project_in.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific project entry (only if user owns the CV)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    verify_cv_ownership(project.cv_id, current_user.id, db)
    return project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a project entry (only if user owns the CV)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    verify_cv_ownership(project.cv_id, current_user.id, db)

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a project entry (only if user owns the CV)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    verify_cv_ownership(project.cv_id, current_user.id, db)

    db.delete(project)
    db.commit()
    return None
