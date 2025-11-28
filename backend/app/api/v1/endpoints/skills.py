from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.cv import CV
from app.models.skill import Skill
from app.models.user import User
from app.schemas.skill import Skill as SkillSchema
from app.schemas.skill import SkillCreate, SkillUpdate

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


@router.post("/", response_model=SkillSchema, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_in: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new skill entry (only for user's own CV)."""
    verify_cv_ownership(skill_in.cv_id, current_user.id, db)

    skill = Skill(**skill_in.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.get("/{skill_id}", response_model=SkillSchema)
def get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific skill entry (only if user owns the CV)."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    verify_cv_ownership(skill.cv_id, current_user.id, db)
    return skill


@router.put("/{skill_id}", response_model=SkillSchema)
def update_skill(
    skill_id: int,
    skill_in: SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a skill entry (only if user owns the CV)."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    verify_cv_ownership(skill.cv_id, current_user.id, db)

    update_data = skill_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(skill, field, value)

    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a skill entry (only if user owns the CV)."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    verify_cv_ownership(skill.cv_id, current_user.id, db)

    db.delete(skill)
    db.commit()
    return None
