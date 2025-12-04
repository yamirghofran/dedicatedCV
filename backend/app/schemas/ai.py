"""Pydantic schemas for AI optimization endpoints."""

from typing import Optional

from pydantic import BaseModel, Field


class OptimizeDescriptionRequest(BaseModel):
    """Request schema for optimizing a CV field description."""

    original_text: str = Field(..., description="Original text to optimize")
    field_type: str = Field(
        ...,
        description="Type of field (work_experience, education, project, summary)",
    )
    context: dict = Field(
        default_factory=dict,
        description="Additional context (position, company, duration, etc.)",
    )


class OptimizeDescriptionResponse(BaseModel):
    """Response schema for optimized description."""

    original: str = Field(..., description="Original text")
    optimized: str = Field(..., description="AI-optimized text")


class GenerateSummaryRequest(BaseModel):
    """Request schema for generating professional summary."""

    cv_id: int = Field(..., description="CV ID to generate summary for")
    tone: Optional[str] = Field(
        default="professional", description="Tone (professional, casual, formal)"
    )


class GenerateSummaryResponse(BaseModel):
    """Response schema for generated summary."""

    summary: str = Field(..., description="Generated professional summary")
