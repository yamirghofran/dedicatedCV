from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.base_class import BaseModel


class User(Base, BaseModel):
    """User model."""

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    # Relationships
    cvs = relationship("CV", back_populates="user", cascade="all, delete-orphan")
    share_links = relationship(
        "ShareLink", back_populates="user", cascade="all, delete-orphan"
    )
