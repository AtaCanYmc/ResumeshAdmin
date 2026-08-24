import uuid

from sqlalchemy import Column, DateTime, Integer, String, Text, func

from app.config.database import Base


class Package(Base):
    __tablename__ = "packages"

    id = Column(
        String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    platform = Column(String(255), index=True, default="")
    url = Column(String(255), index=True, default="")
    docs_url = Column(String(255), index=True, default="")
    tags = Column(String(255), index=True, default="")
    version = Column(String(255), index=True, default="")
    last_month_downloads = Column(Integer, index=True, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
