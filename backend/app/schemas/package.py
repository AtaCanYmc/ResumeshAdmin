from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, HttpUrl


class PackageBase(BaseModel):
    title: str
    description: Optional[str] = None
    platform: str = ""
    url: Optional[HttpUrl] = None
    docs_url: Optional[HttpUrl] = None
    tags: str = ""
    version: str = ""
    last_month_downloads: int = 0


class PackageCreate(PackageBase):
    pass


class PackageUpdate(PackageBase):
    pass


class PackageResponse(PackageBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
