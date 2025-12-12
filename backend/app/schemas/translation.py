"""Schemas for translation requests and responses."""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class WorkExperienceSection(BaseModel):
    """Translatable portion of a work experience entry."""

    id: Optional[int] = None
    cv_id: Optional[int] = None
    company: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(extra="ignore")


class EducationSection(BaseModel):
    """Translatable portion of an education entry."""

    id: Optional[int] = None
    cv_id: Optional[int] = None
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    gpa: Optional[float] = Field(default=None, ge=0, le=4.0)
    honors: Optional[str] = None
    relevant_subjects: Optional[str] = None
    thesis_title: Optional[str] = None
    display_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(extra="ignore")


class ProjectSection(BaseModel):
    """Translatable portion of a project entry."""

    id: Optional[int] = None
    cv_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    role: Optional[str] = None
    technologies: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    url: Optional[str] = None
    github_url: Optional[str] = None
    display_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(extra="ignore")


class SkillSection(BaseModel):
    """Translatable portion of a skill entry."""

    id: Optional[int] = None
    cv_id: Optional[int] = None
    name: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(extra="ignore")


class CVTranslation(BaseModel):
    """CV payload supporting partial data for translation."""

    id: Optional[int] = None
    user_id: Optional[int] = None
    title: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    work_experiences: List[WorkExperienceSection] = Field(default_factory=list)
    educations: List[EducationSection] = Field(default_factory=list)
    skills: List[SkillSection] = Field(default_factory=list)
    projects: List[ProjectSection] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class TranslateCVRequest(BaseModel):
    """Request payload for translating a CV."""

    input_language: str = Field(..., description="Source language code (e.g., en)")
    output_language: str = Field(..., description="Target language code (e.g., es)")
    cv: CVTranslation


class TranslateCVResponse(BaseModel):
    """Response payload for translated CV."""

    translation: CVTranslation
