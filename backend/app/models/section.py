import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func

from app.config.database import Base


class Section(Base):
    __tablename__ = "sections"

    id = Column(
        String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    key = Column(String(50), nullable=False, unique=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
