from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db.dependencies import get_section_repo
from app.db.repositories import ISectionRepository
from app.schemas.section import SectionCreate, SectionResponse, SectionUpdate
from app.services.auth_service import get_current_admin
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/sections", tags=["Sections"])


@router.get("/", response_model=List[SectionResponse])
def get_sections(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    section_repo: ISectionRepository = Depends(get_section_repo),
):
    return section_repo.get_sections(skip=skip, limit=limit, active_only=active_only)


@router.get("/{section_id_or_key}", response_model=SectionResponse)
def get_section(
    section_id_or_key: str,
    section_repo: ISectionRepository = Depends(get_section_repo),
):
    section = section_repo.get_section_by_id(
        section_id_or_key
    ) or section_repo.get_section_by_key(section_id_or_key)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section


@router.post("/", response_model=SectionResponse)
def create_section(
    section: SectionCreate,
    section_repo: ISectionRepository = Depends(get_section_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_section = section_repo.create_section(section)
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="section_created",
        properties={
            "section_id": db_section.id,
            "key": db_section.key,
            "title": db_section.title,
            "is_active": db_section.is_active,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return db_section


@router.put("/{section_id_or_key}", response_model=SectionResponse)
def update_section(
    section_id_or_key: str,
    section: SectionUpdate,
    section_repo: ISectionRepository = Depends(get_section_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_section = section_repo.update_section(section_id_or_key, section)
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")

    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="section_updated",
        properties={
            "section_id": db_section.id,
            "key": db_section.key,
            "title": db_section.title,
            "is_active": db_section.is_active,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return db_section


@router.patch("/{section_id_or_key}/toggle", response_model=SectionResponse)
def toggle_section_active(
    section_id_or_key: str,
    section_repo: ISectionRepository = Depends(get_section_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    current = section_repo.get_section_by_id(
        section_id_or_key
    ) or section_repo.get_section_by_key(section_id_or_key)
    if not current:
        raise HTTPException(status_code=404, detail="Section not found")

    new_active_state = not current.is_active
    db_section = section_repo.update_section(
        current.id, SectionUpdate(is_active=new_active_state)
    )

    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="section_toggled",
        properties={
            "section_id": db_section.id,
            "key": db_section.key,
            "is_active": db_section.is_active,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return db_section


@router.delete("/{section_id_or_key}")
def delete_section(
    section_id_or_key: str,
    section_repo: ISectionRepository = Depends(get_section_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_section = section_repo.get_section_by_id(
        section_id_or_key
    ) or section_repo.get_section_by_key(section_id_or_key)
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")

    section_repo.delete_section(db_section.id)

    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="section_deleted",
        properties={
            "section_id": db_section.id,
            "key": db_section.key,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"message": "Section deleted successfully"}
