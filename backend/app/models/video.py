import uuid

from sqlalchemy import Column, DateTime, String, func

from app.config.database import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(
        String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    title = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    platform = Column(String(255), nullable=False)
    url = Column(String(255), nullable=False)
    thumbnail = Column(String(255), nullable=True)
    profile = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
