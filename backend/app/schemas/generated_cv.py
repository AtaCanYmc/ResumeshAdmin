from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class GeneratedCVBase(BaseModel):
    job_title: str
    company_name: str
    job_description_url: Optional[str] = None
    raw_job_description: Optional[str] = None
    cv_content_markdown: str
    pdf_file_path: Optional[str] = None


class GeneratedCVCreate(GeneratedCVBase):
    pass


class GeneratedCVResponse(GeneratedCVBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
