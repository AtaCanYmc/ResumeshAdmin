from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db.dependencies import get_skill_repo
from app.db.repositories import ISkillRepository
from app.schemas.skill import SkillCreate, SkillResponse, SkillUpdate
from app.services.auth_service import get_current_admin
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("/", response_model=List[SkillResponse])
async def get_skills(
    skip: int = 0,
    limit: int = 100,
    skill_repo: ISkillRepository = Depends(get_skill_repo),
):
    return await skill_repo.get_skills(skip=skip, limit=limit)


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(
    skill_id: str,
    skill_repo: ISkillRepository = Depends(get_skill_repo),
):
    skill = await skill_repo.get_skill_by_id(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.post("/", response_model=SkillResponse)
async def create_skill(
    skill: SkillCreate,
    skill_repo: ISkillRepository = Depends(get_skill_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_skill = await skill_repo.create_skill(skill)
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="skill_created",
        properties={
            "skill_id": db_skill.id,
            "name": db_skill.name,
            "category": db_skill.category,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return db_skill


@router.put("/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: str,
    skill: SkillUpdate,
    skill_repo: ISkillRepository = Depends(get_skill_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_skill = await skill_repo.update_skill(skill_id, skill)
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="skill_updated",
        properties={
            "skill_id": skill_id,
            "name": db_skill.name,
            "category": db_skill.category,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return db_skill


@router.delete("/{skill_id}")
async def delete_skill(
    skill_id: str,
    skill_repo: ISkillRepository = Depends(get_skill_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    # Fetch skill details for telemetry first before deleting
    db_skill = await skill_repo.get_skill_by_id(skill_id)
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    await skill_repo.delete_skill(skill_id)

    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="skill_deleted",
        properties={
            "skill_id": skill_id,
            "name": db_skill.name,
            "category": db_skill.category,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"message": "Skill deleted successfully"}
