from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, HttpUrl


class PostBase(BaseModel):
    title: str
    description: Optional[str] = None
    platform: str = ""
    url: Optional[HttpUrl] = None
    thumbnail: Optional[HttpUrl] = None
    profile: str = ""


class PostCreate(PostBase):
    pass


class PostUpdate(PostBase):
    pass


class PostResponse(PostBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
