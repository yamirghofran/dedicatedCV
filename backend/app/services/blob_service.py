"""Azure Blob Storage service for exporting CV PDFs."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Tuple
from uuid import uuid4

from azure.core.exceptions import ResourceExistsError
from azure.storage.blob import (
    BlobSasPermissions,
    BlobServiceClient,
    ContentSettings,
    generate_blob_sas,
)

from app.core.config import settings

logger = logging.getLogger(__name__)


class AzureBlobService:
    """Helper for uploading CV PDFs to Azure Blob Storage and generating SAS links."""

    def __init__(self) -> None:
        if not settings.AZURE_STORAGE_CONNECTION_STRING:
            raise ValueError("AZURE_STORAGE_CONNECTION_STRING not configured")
        if not settings.AZURE_STORAGE_PDF_CONTAINER_NAME:
            raise ValueError("AZURE_STORAGE_PDF_CONTAINER_NAME not configured")
        if not settings.AZURE_STORAGE_PFP_CONTAINER_NAME:
            raise ValueError("AZURE_STORAGE_PFP_CONTAINER_NAME not configured")

        self._client = BlobServiceClient.from_connection_string(
            settings.AZURE_STORAGE_CONNECTION_STRING
        )
        self._pdf_container = self._client.get_container_client(
            settings.AZURE_STORAGE_PDF_CONTAINER_NAME
        )
        self._pfp_container = self._client.get_container_client(
            settings.AZURE_STORAGE_PFP_CONTAINER_NAME
        )

        try:
            self._pdf_container.create_container()
            logger.info(
                "Created Azure blob container '%s'",
                settings.AZURE_STORAGE_PDF_CONTAINER_NAME,
            )
        except ResourceExistsError:
            # Container already exists; nothing to do.
            pass

        try:
            self._pfp_container.create_container()
            logger.info(
                "Created Azure blob container '%s'",
                settings.AZURE_STORAGE_PFP_CONTAINER_NAME,
            )
        except ResourceExistsError:
            # Container already exists; nothing to do.
            pass

    def _get_account_key(self) -> str:
        """
        Resolve an account key for SAS generation.

        Resolves AZURE_STORAGE_ACCOUNT_KEY embedded in the connection string.
        """
        credential = getattr(self._client, "credential", None)
        account_key = getattr(credential, "account_key", None)
        if not account_key:
            raise ValueError("No azure key available from connection string")
        return account_key

    def _generate_sas_url(
        self, blob_name: str, ttl_minutes: int, container: str = "pdf"
    ) -> Tuple[str, datetime]:
        """Generate a SAS URL for a blob with a given TTL."""
        expires_at = datetime.utcnow() + timedelta(minutes=max(ttl_minutes, 1))
        container_client = (
            self._pdf_container if container == "pdf" else self._pfp_container
        )
        sas_token = generate_blob_sas(
            account_name=self._client.account_name,
            container_name=container_client.container_name,
            blob_name=blob_name,
            account_key=self._get_account_key(),
            permission=BlobSasPermissions(read=True),
            expiry=expires_at,
        )
        return f"{container_client.url}/{blob_name}?{sas_token}", expires_at

    def upload_cv_pdf(
        self, *, user_id: int, cv_id: int, data: bytes, filename: str
    ) -> Tuple[str, datetime]:
        """
        Upload a CV PDF and return a time-limited SAS URL.

        Args:
            user_id: ID of the owner.
            cv_id: CV identifier.
            data: PDF bytes.
            filename: Original filename for metadata.

        Returns:
            Tuple containing the SAS URL and expiry datetime.
        """
        blob_name = f"cvs/user-{user_id}/cv-{cv_id}-{uuid4()}.pdf"

        try:
            self._pdf_container.upload_blob(
                name=blob_name,
                data=data,
                overwrite=True,
                content_settings=ContentSettings(content_type="application/pdf"),
                metadata={
                    "cv_id": str(cv_id),
                    "user_id": str(user_id),
                    "filename": filename,
                },
            )
        except Exception:
            logger.exception("Failed to upload CV PDF to Azure Blob Storage")
            raise

        ttl_minutes = max(settings.AZURE_STORAGE_SAS_TTL_MINUTES or 60, 1)
        return self._generate_sas_url(blob_name, ttl_minutes, container="pdf")

    def upload_profile_picture(
        self, *, user_id: int, data: bytes, filename: str
    ) -> Tuple[str, datetime]:
        """
        Upload a profile picture and return a time-limited SAS URL.

        Args:
            user_id: Owner's ID.
            data: Image file bytes.
            filename: Original filename for metadata.

        Returns:
            Tuple containing the SAS URL and expiry datetime.
        """
        ext = (filename.rsplit(".", 1)[-1] or "").lower()
        if ext in ("jpg", "jpeg"):
            content_type = "image/jpeg"
            suffix = "jpg"
        elif ext == "png":
            content_type = "image/png"
            suffix = "png"
        else:
            raise ValueError("Unsupported image format (use jpg or png)")

        # Only one picture per user: stable blob name
        blob_name = f"profile_pictures/user-{user_id}/profile.{suffix}"

        try:
            self._pfp_container.upload_blob(
                name=blob_name,
                data=data,
                overwrite=True,
                content_settings=ContentSettings(content_type=content_type),
                metadata={
                    "user_id": str(user_id),
                    "filename": filename,
                },
            )

            # Long expiry for profile pictures (90 days)
            sas_url, expiry = self._generate_sas_url(
                blob_name, ttl_minutes=90 * 24 * 60, container="pfp"
            )
            return sas_url, expiry

        except Exception as e:
            raise RuntimeError(f"Failed to upload profile picture: {e}")


_blob_service: AzureBlobService | None = None


def get_blob_service() -> AzureBlobService:
    """Return a singleton AzureBlobService instance."""
    global _blob_service
    if _blob_service is None:
        _blob_service = AzureBlobService()
    return _blob_service
