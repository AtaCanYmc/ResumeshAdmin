import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, func

from app.config.database import Base


class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(
        String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    platform = Column(String(50), nullable=False, index=True)
    label = Column(String(100), nullable=False)
    url = Column(String(512), nullable=False)
    icon = Column(String(100), nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
