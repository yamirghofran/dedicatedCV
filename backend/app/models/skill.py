from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.base_class import BaseModel


class Skill(Base, BaseModel):
    """Skill entry."""

    cv_id = Column(Integer, ForeignKey("cv.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    category = Column(
        String, nullable=True
    )  # e.g., "Programming Languages", "Frameworks"
    display_order = Column(Integer, default=0, nullable=False)

    # Relationships
    cv = relationship("CV", back_populates="skills")
