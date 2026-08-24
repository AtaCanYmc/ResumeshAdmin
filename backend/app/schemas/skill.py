from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SkillBase(BaseModel):
    name: str
    category: str
    icon_name: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillUpdate(SkillBase):
    name: Optional[str] = None
    category: Optional[str] = None


class SkillResponse(SkillBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
