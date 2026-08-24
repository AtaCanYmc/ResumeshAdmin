from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.config.database import Base


class GeneratedCV(Base):
    __tablename__ = "generated_cvs"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    job_description_url = Column(String(512), nullable=True)
    raw_job_description = Column(Text, nullable=True)
    cv_content_markdown = Column(Text, nullable=False)
    pdf_file_path = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
