"""Endpoints for exporting CVs to Azure Blob Storage and generating shareable links."""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.cv import CV
from app.models.share_link import ShareLink
from app.models.user import User
from app.schemas.export import ShareLinkResponse
from app.services.blob_service import get_blob_service

router = APIRouter(prefix="/cvs", tags=["exports"])

logger = logging.getLogger(__name__)


def _get_owned_cv(cv_id: int, user_id: int, db: Session) -> CV:
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == user_id).first()
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="CV not found"
        )
    return cv


def _get_existing_share_link(cv_id: int, user_id: int, db: Session) -> ShareLink | None:
    """Return the most recent non-expired share link for this CV/user, if any."""
    now = datetime.utcnow()
    return (
        db.query(ShareLink)
        .filter(
            ShareLink.cv_id == cv_id,
            ShareLink.user_id == user_id,
            ShareLink.expires_at > now,
        )
        .order_by(ShareLink.expires_at.desc())
        .first()
    )


@router.post("/{cv_id}/share-link", response_model=ShareLinkResponse)
async def create_share_link(
    cv_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ShareLinkResponse:
    """
    Upload a CV PDF to Azure Blob Storage and return a shareable SAS link.

    If a non-expired link already exists for this CV/user, it is returned without
    re-uploading.
    """
    _get_owned_cv(cv_id=cv_id, user_id=current_user.id, db=db)

    existing = _get_existing_share_link(cv_id=cv_id, user_id=current_user.id, db=db)
    if existing:
        return ShareLinkResponse(url=existing.url, expires_at=existing.expires_at)

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF uploads are supported",
        )

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty"
        )

    blob_service = get_blob_service()
    try:
        url, expires_at = blob_service.upload_cv_pdf(
            user_id=current_user.id,
            cv_id=cv_id,
            data=pdf_bytes,
            filename=file.filename or f"cv-{cv_id}.pdf",
        )
    except ValueError as exc:
        logger.exception("Storage configuration error while uploading CV")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        ) from exc
    except Exception as exc:
        logger.exception("Failed to upload CV to Azure Blob Storage")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload CV to storage",
        ) from exc

    new_link = ShareLink(
        cv_id=cv_id,
        user_id=current_user.id,
        url=url,
        expires_at=expires_at,
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)

    return ShareLinkResponse(url=new_link.url, expires_at=new_link.expires_at)
