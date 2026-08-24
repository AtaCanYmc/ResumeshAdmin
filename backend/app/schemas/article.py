from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, HttpUrl


class ArticlePlatform(str, Enum):
    MEDIUM = "MEDIUM"
    DEV_TO = "DEV_TO"
    SUBSTACK = "SUBSTACK"


class ArticleBase(BaseModel):
    title: str
    summary: Optional[str] = None
    url: HttpUrl
    platform: ArticlePlatform
    reading_time_minutes: int = 0
    published_at: Optional[datetime] = None
    raw_platform_data: Optional[Dict[str, Any]] = None


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(ArticleBase):
    pass


class ArticleResponse(ArticleBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
