"""Schemas for CV export and sharing endpoints."""

from datetime import datetime

from pydantic import AnyUrl, BaseModel


class ShareLinkResponse(BaseModel):
    """Response payload for a generated shareable link."""

    url: AnyUrl | str
    expires_at: datetime
