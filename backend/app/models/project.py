import uuid

from sqlalchemy import Column, DateTime, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY

from app.config.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(
        String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    url = Column(String(512), nullable=True)
    stars = Column(Integer, default=0)
    watchers = Column(Integer, default=0)
    forks = Column(Integer, default=0)

    # Python mapping for PostgreSQL ARRAY and JSONB types
    languages = Column(ARRAY(String), default=[])
    tags = Column(ARRAY(String), default=[])

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_projects_languages_gin", languages, postgresql_using="gin"),
        Index("ix_projects_tags_gin", tags, postgresql_using="gin"),
    )
