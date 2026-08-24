from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EducationBase(BaseModel):
    school: str
    degree: str
    field_of_study: str
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    grade: Optional[str] = None
    description: Optional[str] = None


class EducationCreate(EducationBase):
    pass


class EducationUpdate(EducationBase):
    school: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None


class EducationResponse(EducationBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
