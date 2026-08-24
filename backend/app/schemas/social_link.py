from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SocialLinkBase(BaseModel):
    id: Optional[str] = None
    platform: str = Field(
        ..., description="Platform name e.g. github, linkedin, devto, medium"
    )
    label: str = Field(..., description="Display label for social link")
    url: str = Field(..., description="Full URL to the social media profile")
    icon: Optional[str] = Field(None, description="Optional icon name")
    order_index: int = Field(0, description="Display order index")
    is_active: bool = Field(True, description="Whether social link is active")


class SocialLinkCreate(SocialLinkBase):
    pass


class SocialLinkUpdate(BaseModel):
    platform: Optional[str] = None
    label: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None


class SocialLinkResponse(SocialLinkBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
