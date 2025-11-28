from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.cv import CV
from app.models.user import User
from app.schemas.cv import CV as CVSchema
from app.schemas.cv import CVCreate, CVUpdate, CVWithRelations

router = APIRouter()


@router.post("/", response_model=CVSchema, status_code=status.HTTP_201_CREATED)
def create_cv(
    cv_in: CVCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new CV for the authenticated user."""
    cv_data = cv_in.model_dump()
    cv = CV(**cv_data, user_id=current_user.id)
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv


@router.get("/", response_model=List[CVSchema])
def list_cvs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all CVs for the authenticated user with pagination."""
    cvs = (
        db.query(CV)
        .filter(CV.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return cvs


@router.get("/{cv_id}", response_model=CVWithRelations)
def get_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific CV with all related data (only if owned by user)."""
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(
            status_code=404, detail="CV not found or you don't have access"
        )
    return cv


@router.put("/{cv_id}", response_model=CVSchema)
def update_cv(
    cv_id: int,
    cv_in: CVUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a CV (only if owned by user)."""
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(
            status_code=404, detail="CV not found or you don't have access"
        )

    update_data = cv_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cv, field, value)

    db.commit()
    db.refresh(cv)
    return cv


@router.delete("/{cv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a CV (only if owned by user, cascade deletes all related data)."""
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(
            status_code=404, detail="CV not found or you don't have access"
        )

    db.delete(cv)
    db.commit()
    return None
