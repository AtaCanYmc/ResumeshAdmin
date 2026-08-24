from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SectionBase(BaseModel):
    id: Optional[str] = None
    key: str = Field(..., description="Unique section key e.g. educations, projects")
    title: str = Field(..., description="Section title e.g. Projects Section")
    description: Optional[str] = Field(
        None, description="Optional description of the section"
    )
    is_active: bool = Field(True, description="Whether section is active/visible")
    order_index: int = Field(0, description="Display order index")


class SectionCreate(SectionBase):
    pass


class SectionUpdate(BaseModel):
    key: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    order_index: Optional[int] = None


class SectionResponse(SectionBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
