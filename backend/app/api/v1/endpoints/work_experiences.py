from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.models.work_experience import WorkExperience
from app.schemas.work_experience import (
    WorkExperience as WorkExperienceSchema,
    WorkExperienceCreate,
    WorkExperienceUpdate,
)

router = APIRouter()


@router.post(
    "/", response_model=WorkExperienceSchema, status_code=status.HTTP_201_CREATED
)
def create_work_experience(
    work_exp_in: WorkExperienceCreate, db: Session = Depends(get_db)
):
    """Create a new work experience entry."""
    work_exp = WorkExperience(**work_exp_in.model_dump())
    db.add(work_exp)
    db.commit()
    db.refresh(work_exp)
    return work_exp


@router.get("/cv/{cv_id}", response_model=List[WorkExperienceSchema])
def list_cv_work_experiences(cv_id: int, db: Session = Depends(get_db)):
    """List all work experiences for a specific CV."""
    work_exps = (
        db.query(WorkExperience)
        .filter(WorkExperience.cv_id == cv_id)
        .order_by(WorkExperience.display_order)
        .all()
    )
    return work_exps


@router.get("/{work_exp_id}", response_model=WorkExperienceSchema)
def get_work_experience(work_exp_id: int, db: Session = Depends(get_db)):
    """Get a specific work experience entry."""
    work_exp = db.query(WorkExperience).filter(WorkExperience.id == work_exp_id).first()
    if not work_exp:
        raise HTTPException(status_code=404, detail="Work experience not found")
    return work_exp


@router.put("/{work_exp_id}", response_model=WorkExperienceSchema)
def update_work_experience(
    work_exp_id: int, work_exp_in: WorkExperienceUpdate, db: Session = Depends(get_db)
):
    """Update a work experience entry."""
    work_exp = db.query(WorkExperience).filter(WorkExperience.id == work_exp_id).first()
    if not work_exp:
        raise HTTPException(status_code=404, detail="Work experience not found")

    update_data = work_exp_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(work_exp, field, value)

    db.commit()
    db.refresh(work_exp)
    return work_exp


@router.delete("/{work_exp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work_experience(work_exp_id: int, db: Session = Depends(get_db)):
    """Delete a work experience entry."""
    work_exp = db.query(WorkExperience).filter(WorkExperience.id == work_exp_id).first()
    if not work_exp:
        raise HTTPException(status_code=404, detail="Work experience not found")

    db.delete(work_exp)
    db.commit()
    return None
