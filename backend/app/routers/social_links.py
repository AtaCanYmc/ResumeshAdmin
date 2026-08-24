from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db.dependencies import get_social_link_repo
from app.db.repositories import ISocialLinkRepository
from app.schemas.social_link import (
    SocialLinkCreate,
    SocialLinkResponse,
    SocialLinkUpdate,
)
from app.services.auth_service import get_current_admin
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/social-links", tags=["Social Links"])


@router.get("/", response_model=List[SocialLinkResponse])
def get_social_links(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    social_link_repo: ISocialLinkRepository = Depends(get_social_link_repo),
):
    return social_link_repo.get_social_links(
        skip=skip, limit=limit, active_only=active_only
    )


@router.get("/{social_link_id}", response_model=SocialLinkResponse)
def get_social_link(
    social_link_id: str,
    social_link_repo: ISocialLinkRepository = Depends(get_social_link_repo),
):
    social_link = social_link_repo.get_social_link_by_id(social_link_id)
    if not social_link:
        raise HTTPException(status_code=404, detail="Social link not found")
    return social_link


@router.post("/", response_model=SocialLinkResponse)
def create_social_link(
    social_link: SocialLinkCreate,
    social_link_repo: ISocialLinkRepository = Depends(get_social_link_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_social_link = social_link_repo.create_social_link(social_link)
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="social_link_created",
        properties={
            "social_link_id": db_social_link.id,
            "platform": db_social_link.platform,
            "label": db_social_link.label,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return db_social_link


@router.put("/{social_link_id}", response_model=SocialLinkResponse)
def update_social_link(
    social_link_id: str,
    social_link: SocialLinkUpdate,
    social_link_repo: ISocialLinkRepository = Depends(get_social_link_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_social_link = social_link_repo.update_social_link(social_link_id, social_link)
    if not db_social_link:
        raise HTTPException(status_code=404, detail="Social link not found")

    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="social_link_updated",
        properties={
            "social_link_id": social_link_id,
            "platform": db_social_link.platform,
            "label": db_social_link.label,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return db_social_link


@router.delete("/{social_link_id}")
def delete_social_link(
    social_link_id: str,
    social_link_repo: ISocialLinkRepository = Depends(get_social_link_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_social_link = social_link_repo.get_social_link_by_id(social_link_id)
    if not db_social_link:
        raise HTTPException(status_code=404, detail="Social link not found")

    social_link_repo.delete_social_link(social_link_id)

    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="social_link_deleted",
        properties={
            "social_link_id": social_link_id,
            "platform": db_social_link.platform,
            "label": db_social_link.label,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"message": "Social link deleted successfully"}
