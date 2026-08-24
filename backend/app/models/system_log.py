import uuid

from sqlalchemy import JSON, Column, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB

from app.config.database import Base


class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(
        String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    level = Column(String(50), nullable=False)  # INFO, WARNING, ERROR, CRITICAL
    module = Column(
        String(100), nullable=False
    )  # GITHUB, MEDIUM, DEV_TO, AI_CV, SYSTEM
    message = Column(Text, nullable=False)

    user_id = Column(String(50), nullable=True, index=True)
    request_id = Column(String(50), nullable=True, index=True)
    ip_address = Column(String(50), nullable=True)
    endpoint = Column(String(255), nullable=True)

    details = Column(JSON().with_variant(JSONB, "postgresql"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
