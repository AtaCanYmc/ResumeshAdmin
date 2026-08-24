from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ExperienceBase(BaseModel):
    company_name: str
    title: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(ExperienceBase):
    pass


class ExperienceResponse(ExperienceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
