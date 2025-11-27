from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class CVBase(BaseModel):
    """Base CV schema with common fields."""

    title: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None


class CVCreate(CVBase):
    """Schema for creating a CV."""

    user_id: int  # Required for creation (no auth)


class CVUpdate(BaseModel):
    """Schema for updating a CV."""

    title: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None


class CVInDBBase(CVBase):
    """Base schema for CV in database."""

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CV(CVInDBBase):
    """Schema for returning CV to client (without relationships)."""

    pass


# Import here to avoid circular imports
class CVWithRelations(CVInDBBase):
    """Schema for returning CV with all related data."""

    work_experiences: List["WorkExperience"] = []
    educations: List["Education"] = []
    skills: List["Skill"] = []
    projects: List["Project"] = []


# Forward references for relationships
from app.schemas.education import Education
from app.schemas.project import Project
from app.schemas.skill import Skill
from app.schemas.work_experience import WorkExperience

CVWithRelations.model_rebuild()
