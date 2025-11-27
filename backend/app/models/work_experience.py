from sqlalchemy import Column, String, Text, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.base_class import BaseModel


class WorkExperience(Base, BaseModel):
    """Work experience entry."""

    cv_id = Column(Integer, ForeignKey("cv.id"), nullable=False, index=True)
    company = Column(String, nullable=False)
    position = Column(String, nullable=False)
    location = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # NULL if current position
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)

    # Relationships
    cv = relationship("CV", back_populates="work_experiences")
