from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProjectBase(BaseModel):
    """Base project schema."""

    name: str
    description: Optional[str] = None
    role: Optional[str] = None
    technologies: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    url: Optional[str] = None
    github_url: Optional[str] = None
    display_order: int = 0


class ProjectCreate(ProjectBase):
    """Schema for creating project."""

    cv_id: int


class ProjectUpdate(BaseModel):
    """Schema for updating project."""

    name: Optional[str] = None
    description: Optional[str] = None
    role: Optional[str] = None
    technologies: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    url: Optional[str] = None
    github_url: Optional[str] = None
    display_order: Optional[int] = None


class ProjectInDBBase(ProjectBase):
    """Base schema for project in database."""

    id: int
    cv_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Project(ProjectInDBBase):
    """Schema for returning project to client."""

    pass
