from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db.dependencies import get_education_repo
from app.db.repositories import IEducationRepository
from app.schemas.education import EducationCreate, EducationResponse, EducationUpdate
from app.services.auth_service import get_current_admin
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/educations", tags=["Educations"])


@router.get("/", response_model=List[EducationResponse])
async def get_educations(
    skip: int = 0,
    limit: int = 100,
    education_repo: IEducationRepository = Depends(get_education_repo),
):
    return await education_repo.get_educations(skip=skip, limit=limit)


@router.get("/{education_id}", response_model=EducationResponse)
async def get_education(
    education_id: str,
    education_repo: IEducationRepository = Depends(get_education_repo),
):
    education = await education_repo.get_education_by_id(education_id)
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")
    return education


@router.post("/", response_model=EducationResponse)
async def create_education(
    education: EducationCreate,
    education_repo: IEducationRepository = Depends(get_education_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_education = await education_repo.create_education(education)
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="education_created",
        properties={
            "education_id": db_education.id,
            "school": db_education.school,
            "degree": db_education.degree,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return db_education


@router.put("/{education_id}", response_model=EducationResponse)
async def update_education(
    education_id: str,
    education: EducationUpdate,
    education_repo: IEducationRepository = Depends(get_education_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    db_education = await education_repo.update_education(education_id, education)
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")

    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="education_updated",
        properties={
            "education_id": education_id,
            "school": db_education.school,
            "degree": db_education.degree,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return db_education


@router.delete("/{education_id}")
async def delete_education(
    education_id: str,
    education_repo: IEducationRepository = Depends(get_education_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    # Fetch education details for telemetry first before deleting
    db_education = await education_repo.get_education_by_id(education_id)
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")

    await education_repo.delete_education(education_id)

    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="education_deleted",
        properties={
            "education_id": education_id,
            "school": db_education.school,
            "degree": db_education.degree,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"message": "Education deleted successfully"}
