from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.cv import CV
from app.models.user import User
from app.models.work_experience import WorkExperience
from app.schemas.work_experience import (
    WorkExperience as WorkExperienceSchema,
    WorkExperienceCreate,
    WorkExperienceUpdate,
)

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


@router.post(
    "/", response_model=WorkExperienceSchema, status_code=status.HTTP_201_CREATED
)
def create_work_experience(
    work_exp_in: WorkExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new work experience entry (only for user's own CV)."""
    # Verify CV ownership
    verify_cv_ownership(work_exp_in.cv_id, current_user.id, db)

    work_exp = WorkExperience(**work_exp_in.model_dump())
    db.add(work_exp)
    db.commit()
    db.refresh(work_exp)
    return work_exp


@router.get("/{work_exp_id}", response_model=WorkExperienceSchema)
def get_work_experience(
    work_exp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific work experience entry (only if user owns the CV)."""
    work_exp = db.query(WorkExperience).filter(WorkExperience.id == work_exp_id).first()
    if not work_exp:
        raise HTTPException(status_code=404, detail="Work experience not found")

    # Verify ownership through CV
    verify_cv_ownership(work_exp.cv_id, current_user.id, db)
    return work_exp


@router.put("/{work_exp_id}", response_model=WorkExperienceSchema)
def update_work_experience(
    work_exp_id: int,
    work_exp_in: WorkExperienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a work experience entry (only if user owns the CV)."""
    work_exp = db.query(WorkExperience).filter(WorkExperience.id == work_exp_id).first()
    if not work_exp:
        raise HTTPException(status_code=404, detail="Work experience not found")

    # Verify ownership through CV
    verify_cv_ownership(work_exp.cv_id, current_user.id, db)

    update_data = work_exp_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(work_exp, field, value)

    db.commit()
    db.refresh(work_exp)
    return work_exp


@router.delete("/{work_exp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work_experience(
    work_exp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a work experience entry (only if user owns the CV)."""
    work_exp = db.query(WorkExperience).filter(WorkExperience.id == work_exp_id).first()
    if not work_exp:
        raise HTTPException(status_code=404, detail="Work experience not found")

    # Verify ownership through CV
    verify_cv_ownership(work_exp.cv_id, current_user.id, db)

    db.delete(work_exp)
    db.commit()
    return None
