"""Dashboard schemas."""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.cv import CV


class IncompleteCVInfo(BaseModel):
    """Information about an incomplete CV."""

    id: int
    title: str
    completion_rate: float
    missing_sections: list[str]

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    """Dashboard statistics for a user."""

    total_cvs: int
    templates_used: int
    avg_completion_rate: float
    last_activity: datetime
    recent_cvs: list[CV]
    incomplete_cvs: list[IncompleteCVInfo]

    model_config = {"from_attributes": True}
