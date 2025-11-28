from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.cv import CV
from app.models.education import Education
from app.models.user import User
from app.schemas.education import (
    Education as EducationSchema,
    EducationCreate,
    EducationUpdate,
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


@router.post("/", response_model=EducationSchema, status_code=status.HTTP_201_CREATED)
def create_education(
    education_in: EducationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new education entry (only for user's own CV)."""
    verify_cv_ownership(education_in.cv_id, current_user.id, db)

    education = Education(**education_in.model_dump())
    db.add(education)
    db.commit()
    db.refresh(education)
    return education


@router.get("/{education_id}", response_model=EducationSchema)
def get_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific education entry (only if user owns the CV)."""
    education = db.query(Education).filter(Education.id == education_id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    verify_cv_ownership(education.cv_id, current_user.id, db)
    return education


@router.put("/{education_id}", response_model=EducationSchema)
def update_education(
    education_id: int,
    education_in: EducationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an education entry (only if user owns the CV)."""
    education = db.query(Education).filter(Education.id == education_id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    verify_cv_ownership(education.cv_id, current_user.id, db)

    update_data = education_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(education, field, value)

    db.commit()
    db.refresh(education)
    return education


@router.delete("/{education_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an education entry (only if user owns the CV)."""
    education = db.query(Education).filter(Education.id == education_id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    verify_cv_ownership(education.cv_id, current_user.id, db)

    db.delete(education)
    db.commit()
    return None
