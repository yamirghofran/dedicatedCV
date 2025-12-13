from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.base_class import BaseModel


class CV(Base, BaseModel):
    """CV model - main resume document."""

    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    title = Column(String, nullable=False)

    # Personal/Contact Information (embedded in CV)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    summary = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="cvs")
    work_experiences = relationship(
        "WorkExperience", back_populates="cv", cascade="all, delete-orphan"
    )
    educations = relationship(
        "Education", back_populates="cv", cascade="all, delete-orphan"
    )
    skills = relationship("Skill", back_populates="cv", cascade="all, delete-orphan")
    projects = relationship(
        "Project", back_populates="cv", cascade="all, delete-orphan"
    )
    share_links = relationship(
        "ShareLink", back_populates="cv", cascade="all, delete-orphan"
    )
