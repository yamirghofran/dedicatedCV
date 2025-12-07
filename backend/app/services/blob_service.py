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
        if not settings.AZURE_STORAGE_CONTAINER_NAME:
            raise ValueError("AZURE_STORAGE_CONTAINER_NAME not configured")

        self._client = BlobServiceClient.from_connection_string(
            settings.AZURE_STORAGE_CONNECTION_STRING
        )
        self._container = self._client.get_container_client(
            settings.AZURE_STORAGE_CONTAINER_NAME
        )

        try:
            self._container.create_container()
            logger.info(
                "Created Azure blob container '%s'",
                settings.AZURE_STORAGE_CONTAINER_NAME,
            )
        except ResourceExistsError:
            # Container already exists; nothing to do.
            pass

    def _get_account_key(self) -> str:
        """
        Resolve an account key for SAS generation.

        Prefers explicit AZURE_STORAGE_ACCOUNT_KEY, otherwise falls back to the
        key embedded in the connection string.
        """
        if settings.AZURE_STORAGE_ACCOUNT_KEY:
            return settings.AZURE_STORAGE_ACCOUNT_KEY

        credential = getattr(self._client, "credential", None)
        account_key = getattr(credential, "account_key", None)
        if not account_key:
            raise ValueError(
                "AZURE_STORAGE_ACCOUNT_KEY not configured and no key available from connection string"
            )
        return account_key

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
            self._container.upload_blob(
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
        expires_at = datetime.utcnow() + timedelta(minutes=ttl_minutes)
        sas_token = generate_blob_sas(
            account_name=self._client.account_name,
            container_name=self._container.container_name,
            blob_name=blob_name,
            account_key=self._get_account_key(),
            permission=BlobSasPermissions(read=True),
            expiry=expires_at,
        )

        url = f"{self._container.url}/{blob_name}?{sas_token}"
        return url, expires_at


_blob_service: AzureBlobService | None = None


def get_blob_service() -> AzureBlobService:
    """Return a singleton AzureBlobService instance."""
    global _blob_service
    if _blob_service is None:
        _blob_service = AzureBlobService()
    return _blob_service
