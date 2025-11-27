from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.models.skill import Skill
from app.schemas.skill import Skill as SkillSchema
from app.schemas.skill import SkillCreate, SkillUpdate

router = APIRouter()


@router.post("/", response_model=SkillSchema, status_code=status.HTTP_201_CREATED)
def create_skill(skill_in: SkillCreate, db: Session = Depends(get_db)):
    """Create a new skill entry."""
    skill = Skill(**skill_in.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.get("/cv/{cv_id}", response_model=List[SkillSchema])
def list_cv_skills(cv_id: int, db: Session = Depends(get_db)):
    """List all skills for a specific CV."""
    skills = (
        db.query(Skill).filter(Skill.cv_id == cv_id).order_by(Skill.display_order).all()
    )
    return skills


@router.get("/{skill_id}", response_model=SkillSchema)
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    """Get a specific skill entry."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.put("/{skill_id}", response_model=SkillSchema)
def update_skill(skill_id: int, skill_in: SkillUpdate, db: Session = Depends(get_db)):
    """Update a skill entry."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    update_data = skill_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(skill, field, value)

    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    """Delete a skill entry."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(skill)
    db.commit()
    return None
