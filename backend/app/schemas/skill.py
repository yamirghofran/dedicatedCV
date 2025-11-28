from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SkillBase(BaseModel):
    """Base skill schema."""

    name: str
    category: Optional[str] = None
    display_order: int = 0


class SkillCreate(SkillBase):
    """Schema for creating skill."""

    cv_id: int


class SkillUpdate(BaseModel):
    """Schema for updating skill."""

    name: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None


class SkillInDBBase(SkillBase):
    """Base schema for skill in database."""

    id: int
    cv_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Skill(SkillInDBBase):
    """Schema for returning skill to client."""

    pass
