import uuid

from sqlalchemy import Column, Date, DateTime, String, func

from app.config.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(
        String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    name = Column(String(255), nullable=False)
    issuing_organization = Column(String(255), nullable=False)
    issue_date = Column(Date, nullable=True)
    credential_id = Column(String(255), nullable=True)
    credential_url = Column(String(512), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
