from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class WorkExperienceBase(BaseModel):
    """Base work experience schema."""

    company: str
    position: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    display_order: int = 0


class WorkExperienceCreate(WorkExperienceBase):
    """Schema for creating work experience."""

    cv_id: int


class WorkExperienceUpdate(BaseModel):
    """Schema for updating work experience."""

    company: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    display_order: Optional[int] = None


class WorkExperienceInDBBase(WorkExperienceBase):
    """Base schema for work experience in database."""

    id: int
    cv_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkExperience(WorkExperienceInDBBase):
    """Schema for returning work experience to client."""

    pass
