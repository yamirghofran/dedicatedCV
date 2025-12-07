"""Shareable link model for CV exports."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.base_class import BaseModel


class ShareLink(Base, BaseModel):
    """Stores generated shareable links for CV PDFs."""

    __tablename__ = "sharelink"

    cv_id = Column(
        Integer, ForeignKey("cv.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(
        Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True
    )
    url = Column(Text, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)

    cv = relationship("CV", back_populates="share_links")
    user = relationship("User", back_populates="share_links")
