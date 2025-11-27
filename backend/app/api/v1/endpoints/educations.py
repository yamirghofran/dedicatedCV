from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.models.education import Education
from app.schemas.education import (
    Education as EducationSchema,
    EducationCreate,
    EducationUpdate,
)

router = APIRouter()


@router.post("/", response_model=EducationSchema, status_code=status.HTTP_201_CREATED)
def create_education(education_in: EducationCreate, db: Session = Depends(get_db)):
    """Create a new education entry."""
    education = Education(**education_in.model_dump())
    db.add(education)
    db.commit()
    db.refresh(education)
    return education


@router.get("/cv/{cv_id}", response_model=List[EducationSchema])
def list_cv_educations(cv_id: int, db: Session = Depends(get_db)):
    """List all education entries for a specific CV."""
    educations = (
        db.query(Education)
        .filter(Education.cv_id == cv_id)
        .order_by(Education.display_order)
        .all()
    )
    return educations


@router.get("/{education_id}", response_model=EducationSchema)
def get_education(education_id: int, db: Session = Depends(get_db)):
    """Get a specific education entry."""
    education = db.query(Education).filter(Education.id == education_id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")
    return education


@router.put("/{education_id}", response_model=EducationSchema)
def update_education(
    education_id: int, education_in: EducationUpdate, db: Session = Depends(get_db)
):
    """Update an education entry."""
    education = db.query(Education).filter(Education.id == education_id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    update_data = education_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(education, field, value)

    db.commit()
    db.refresh(education)
    return education


@router.delete("/{education_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(education_id: int, db: Session = Depends(get_db)):
    """Delete an education entry."""
    education = db.query(Education).filter(Education.id == education_id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    db.delete(education)
    db.commit()
    return None
