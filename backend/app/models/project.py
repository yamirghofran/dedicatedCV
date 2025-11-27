from sqlalchemy import Column, String, Text, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.base_class import BaseModel


class Project(Base, BaseModel):
    """Project entry."""

    cv_id = Column(Integer, ForeignKey("cv.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    role = Column(String, nullable=True)  # e.g., "Lead Developer", "Contributor"
    technologies = Column(String, nullable=True)  # Comma-separated or JSON string
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)  # NULL if ongoing
    url = Column(String, nullable=True)  # Project website/demo URL
    github_url = Column(String, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)

    # Relationships
    cv = relationship("CV", back_populates="projects")
