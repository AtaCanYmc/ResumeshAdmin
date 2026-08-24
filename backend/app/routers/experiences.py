from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db.dependencies import get_experience_repo
from app.db.repositories import IExperienceRepository
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceResponse,
    ExperienceUpdate,
)
from app.services.auth_service import get_current_admin
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/experiences", tags=["experiences"])


@router.post("/", response_model=ExperienceResponse)
async def create_experience(
    experience: ExperienceCreate,
    provider: IExperienceRepository = Depends(get_experience_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    try:
        result = await provider.create_experience(experience)
        telemetry_ctx["background_tasks"].add_task(
            telemetry.capture_event,
            distinct_id=telemetry_ctx["ip"],
            event_name="experience_created",
            properties={
                "experience_id": result.id if hasattr(result, "id") else None,
                "company_name": experience.company_name,
                "title": experience.title,
                "ip": telemetry_ctx["ip"],
                "user_agent": telemetry_ctx["ua"],
            },
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[ExperienceResponse])
async def get_experiences(
    skip: int = 0,
    limit: int = 100,
    provider: IExperienceRepository = Depends(get_experience_repo),
):
    try:
        experiences = await provider.get_all_experiences(skip=skip, limit=limit)
        return experiences
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: str,
    experience: ExperienceUpdate,
    provider: IExperienceRepository = Depends(get_experience_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    updated = await provider.update_experience(experience_id, experience)
    if not updated:
        raise HTTPException(status_code=404, detail="Experience not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="experience_updated",
        properties={
            "experience_id": experience_id,
            "company_name": getattr(updated, "company_name", None),
            "title": getattr(updated, "title", None),
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return updated


@router.delete("/{experience_id}")
async def delete_experience(
    experience_id: str,
    provider: IExperienceRepository = Depends(get_experience_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    deleted = await provider.delete_experience(experience_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Experience not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="experience_deleted",
        properties={
            "experience_id": experience_id,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"status": "success"}
