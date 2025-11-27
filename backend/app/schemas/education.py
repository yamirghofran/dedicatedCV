from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EducationBase(BaseModel):
    """Base education schema."""

    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    gpa: Optional[Decimal] = Field(None, ge=0, le=4.0)  # 0.00 to 4.00
    honors: Optional[str] = None
    relevant_subjects: Optional[str] = None
    thesis_title: Optional[str] = None
    display_order: int = 0


class EducationCreate(EducationBase):
    """Schema for creating education entry."""

    cv_id: int


class EducationUpdate(BaseModel):
    """Schema for updating education entry."""

    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    gpa: Optional[Decimal] = Field(None, ge=0, le=4.0)
    honors: Optional[str] = None
    relevant_subjects: Optional[str] = None
    thesis_title: Optional[str] = None
    display_order: Optional[int] = None


class EducationInDBBase(EducationBase):
    """Base schema for education in database."""

    id: int
    cv_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Education(EducationInDBBase):
    """Schema for returning education to client."""

    pass
