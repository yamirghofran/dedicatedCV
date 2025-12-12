"""Endpoints for translating CV content."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.translation import TranslateCVRequest, TranslateCVResponse
from app.services.translation_service import get_translation_service

router = APIRouter(prefix="/translation", tags=["translation"])

logger = logging.getLogger(__name__)


@router.post("/translate-cv", response_model=TranslateCVResponse)
def translate_cv_endpoint(
    request: TranslateCVRequest,
    current_user: User = Depends(get_current_user),
) -> TranslateCVResponse:
    """
    Translate a CV between languages.

    - input_language/output_language: ISO-like language codes (en, es)
    - cv: CV payload (full or partial) to translate
    """
    if request.cv.user_id and request.cv.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to translate this CV",
        )

    service = get_translation_service()

    logger.info("Got trans service")

    try:
        translated = service.translate_cv(
            cv=request.cv,
            input_language=request.input_language,
            output_language=request.output_language,
        )
        return TranslateCVResponse(translation=translated)
    except ConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_400_BAD_REQUEST
            if "Unsupported translation direction" in detail
            else status.HTTP_503_SERVICE_UNAVAILABLE
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to translate CV: {exc}",
        ) from exc
