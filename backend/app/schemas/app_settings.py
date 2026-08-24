from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, ConfigDict


class AppSettingsBase(BaseModel):
    sections: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None
    socials: Optional[List[Dict[str, Any]]] = None
    footer: Optional[Dict[str, Any]] = None
    marquee: Optional[List[str]] = None
    en: Optional[Dict[str, Any]] = None
    tr: Optional[Dict[str, Any]] = None
    integrations: Optional[Dict[str, Any]] = None
    llm: Optional[Dict[str, Any]] = None


class AppSettingsCreate(AppSettingsBase):
    pass


class AppSettingsUpdate(BaseModel):
    """All fields optional — send only what you want to change."""

    sections: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None
    socials: Optional[List[Dict[str, Any]]] = None
    footer: Optional[Dict[str, Any]] = None
    marquee: Optional[List[str]] = None
    en: Optional[Dict[str, Any]] = None
    tr: Optional[Dict[str, Any]] = None
    integrations: Optional[Dict[str, Any]] = None
    llm: Optional[Dict[str, Any]] = None


class AppSettingsResponse(AppSettingsBase):
    """The response shape is identical to the old wide-table response.

    The frontend does not need to know about the underlying KV storage.
    """

    model_config = ConfigDict(from_attributes=True)
