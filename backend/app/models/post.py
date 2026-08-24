import uuid

from sqlalchemy import Column, DateTime, String, Text, func

from app.config.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(
        String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    title = Column(String(255), index=True, default="")
    description = Column(Text, nullable=True)
    platform = Column(String(255), index=True, default="")
    url = Column(String(255), index=True, default="")
    thumbnail = Column(String(255), index=True, default="")
    profile = Column(String(255), index=True, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
