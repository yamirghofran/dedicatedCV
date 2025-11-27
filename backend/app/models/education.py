from sqlalchemy import DECIMAL, Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.base_class import BaseModel


class Education(Base, BaseModel):
    """Education entry."""

    cv_id = Column(Integer, ForeignKey("cv.id"), nullable=False, index=True)
    institution = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    field_of_study = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # NULL if currently enrolled
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    gpa = Column(DECIMAL(3, 2), nullable=True)
    honors = Column(String, nullable=True)
    relevant_subjects = Column(Text, nullable=True)
    thesis_title = Column(String, nullable=True)

    # Relationships
    cv = relationship("CV", back_populates="educations")
