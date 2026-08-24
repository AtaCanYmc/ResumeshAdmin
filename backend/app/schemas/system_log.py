from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class SystemLogBase(BaseModel):
    level: str
    module: str
    message: str
    user_id: Optional[str] = None
    request_id: Optional[str] = None
    ip_address: Optional[str] = None
    endpoint: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class SystemLogCreate(SystemLogBase):
    pass


class SystemLogResponse(SystemLogBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
