import uuid

from sqlalchemy import Column, DateTime, String, func

from app.config.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(
        String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    icon_name = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
