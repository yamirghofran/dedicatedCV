"""Dashboard statistics endpoints."""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.cv import CV
from app.models.education import Education
from app.models.project import Project
from app.models.skill import Skill
from app.models.work_experience import WorkExperience
from app.models.user import User
from app.schemas.dashboard import DashboardStats, IncompleteCVInfo

router = APIRouter()


def calculate_cv_completion(cv: CV, db: Session) -> tuple[float, list[str]]:
    """Calculate completion percentage and missing sections for a CV."""
    total_fields = 6  # title, full_name, email, phone, location, summary
    filled_fields = 3  # title, full_name, email are required

    # Check optional fields
    if cv.phone:
        filled_fields += 1
    if cv.location:
        filled_fields += 1
    if cv.summary:
        filled_fields += 1

    missing_sections = []

    # Check for related data
    work_count = (
        db.query(WorkExperience).filter(WorkExperience.cv_id == cv.id).count()
    )
    edu_count = db.query(Education).filter(Education.cv_id == cv.id).count()
    skill_count = db.query(Skill).filter(Skill.cv_id == cv.id).count()
    project_count = db.query(Project).filter(Project.cv_id == cv.id).count()

    # Sections are weighted equally with basic fields
    sections_weight = 4  # work, education, skills, projects
    total_weight = total_fields + sections_weight

    section_score = 0
    if work_count > 0:
        section_score += 1
    else:
        missing_sections.append("Work Experience")

    if edu_count > 0:
        section_score += 1
    else:
        missing_sections.append("Education")

    if skill_count > 0:
        section_score += 1
    else:
        missing_sections.append("Skills")

    if project_count > 0:
        section_score += 1
    else:
        missing_sections.append("Projects")

    total_score = filled_fields + section_score
    completion_rate = (total_score / total_weight) * 100

    return round(completion_rate, 1), missing_sections


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get dashboard statistics for the current user.

    Returns:
    - Total number of CVs
    - Number of unique templates used (placeholder)
    - Average completion rate across all CVs
    - Last activity timestamp
    - Recent CVs (last 3 updated)
    - Incomplete CVs with missing sections
    """
    # Get all user's CVs
    cvs = db.query(CV).filter(CV.user_id == current_user.id).all()

    total_cvs = len(cvs)

    if total_cvs == 0:
        return DashboardStats(
            total_cvs=0,
            templates_used=0,
            avg_completion_rate=0.0,
            last_activity=current_user.updated_at,
            recent_cvs=[],
            incomplete_cvs=[],
        )

    # Calculate completion rates
    completion_rates = []
    incomplete_list = []

    for cv in cvs:
        completion_rate, missing = calculate_cv_completion(cv, db)
        completion_rates.append(completion_rate)

        if completion_rate < 100:
            incomplete_list.append(
                IncompleteCVInfo(
                    id=cv.id,
                    title=cv.title,
                    completion_rate=completion_rate,
                    missing_sections=missing,
                )
            )

    avg_completion = (
        round(sum(completion_rates) / len(completion_rates), 1)
        if completion_rates
        else 0.0
    )

    # Get most recent CVs (last 3)
    recent_cvs = (
        db.query(CV)
        .filter(CV.user_id == current_user.id)
        .order_by(CV.updated_at.desc())
        .limit(3)
        .all()
    )

    # Get last activity (most recent CV update)
    last_activity = max((cv.updated_at for cv in cvs), default=current_user.updated_at)

    # Templates used - for now, we'll estimate based on CV count
    # In the future, you could track which template each CV uses
    templates_used = min(total_cvs, 3)  # Assume max 3 templates available

    return DashboardStats(
        total_cvs=total_cvs,
        templates_used=templates_used,
        avg_completion_rate=avg_completion,
        last_activity=last_activity,
        recent_cvs=recent_cvs,
        incomplete_cvs=incomplete_list[:5],  # Show top 5 incomplete CVs
    )
