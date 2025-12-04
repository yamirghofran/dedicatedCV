"""AI optimization endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.cv import CV
from app.models.user import User
from app.schemas.ai import (
    GenerateSummaryRequest,
    GenerateSummaryResponse,
    OptimizeDescriptionRequest,
    OptimizeDescriptionResponse,
)
from app.services.ai_service import get_ai_service

router = APIRouter()


@router.post("/optimize-description", response_model=OptimizeDescriptionResponse)
def optimize_description(
    request: OptimizeDescriptionRequest,
    current_user: User = Depends(get_current_user),
) -> OptimizeDescriptionResponse:
    """
    Optimize a CV field description using AI.

    - **original_text**: Text to optimize
    - **field_type**: Type of field (work_experience, education, project, summary)
    - **context**: Additional context (position, company, duration, etc.)
    """
    try:
        ai_service = get_ai_service()
        optimized = ai_service.optimize_description(
            original_text=request.original_text,
            field_type=request.field_type,
            context=request.context,
        )

        return OptimizeDescriptionResponse(
            original=request.original_text, optimized=optimized
        )
    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service not configured: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize text: {str(e)}",
        )


@router.post("/generate-summary", response_model=GenerateSummaryResponse)
def generate_summary(
    request: GenerateSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GenerateSummaryResponse:
    """
    Generate a professional summary based on CV data.

    - **cv_id**: ID of the CV to generate summary for
    - **tone**: Tone of summary (professional, casual, formal)
    """
    # Fetch CV with all relations
    cv = (
        db.query(CV)
        .filter(CV.id == request.cv_id, CV.user_id == current_user.id)
        .first()
    )

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found",
        )

    # Build CV data dict
    cv_data = {
        "work_experiences": [
            {
                "position": exp.position,
                "company": exp.company,
                "description": exp.description,
            }
            for exp in cv.work_experiences
        ],
        "educations": [
            {
                "degree": edu.degree,
                "institution": edu.institution,
                "field_of_study": edu.field_of_study,
            }
            for edu in cv.educations
        ],
        "skills": [{"name": skill.name} for skill in cv.skills],
    }

    try:
        ai_service = get_ai_service()
        summary = ai_service.generate_summary(
            cv_data=cv_data, tone=request.tone or "professional"
        )

        return GenerateSummaryResponse(summary=summary)
    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service not configured: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}",
        )
