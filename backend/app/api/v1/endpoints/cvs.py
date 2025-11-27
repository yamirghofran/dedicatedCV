from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.models.cv import CV
from app.schemas.cv import CV as CVSchema
from app.schemas.cv import CVCreate, CVUpdate, CVWithRelations

router = APIRouter()


@router.post("/", response_model=CVSchema, status_code=status.HTTP_201_CREATED)
def create_cv(cv_in: CVCreate, db: Session = Depends(get_db)):
    """Create a new CV."""
    cv = CV(**cv_in.model_dump())
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv


@router.get("/", response_model=List[CVSchema])
def list_cvs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all CVs with pagination."""
    cvs = db.query(CV).offset(skip).limit(limit).all()
    return cvs


@router.get("/user/{user_id}", response_model=List[CVSchema])
def list_user_cvs(user_id: int, db: Session = Depends(get_db)):
    """List all CVs for a specific user."""
    cvs = db.query(CV).filter(CV.user_id == user_id).all()
    return cvs


@router.get("/{cv_id}", response_model=CVWithRelations)
def get_cv(cv_id: int, db: Session = Depends(get_db)):
    """Get a specific CV with all related data."""
    cv = db.query(CV).filter(CV.id == cv_id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv


@router.put("/{cv_id}", response_model=CVSchema)
def update_cv(cv_id: int, cv_in: CVUpdate, db: Session = Depends(get_db)):
    """Update a CV."""
    cv = db.query(CV).filter(CV.id == cv_id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    update_data = cv_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cv, field, value)

    db.commit()
    db.refresh(cv)
    return cv


@router.delete("/{cv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cv(cv_id: int, db: Session = Depends(get_db)):
    """Delete a CV (cascade deletes all related data)."""
    cv = db.query(CV).filter(CV.id == cv_id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    db.delete(cv)
    db.commit()
    return None
