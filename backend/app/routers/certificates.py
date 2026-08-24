from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db.dependencies import get_certificate_repo
from app.db.repositories import ICertificateRepository
from app.schemas.certificate import (
    CertificateCreate,
    CertificateResponse,
    CertificateUpdate,
)
from app.services.auth_service import get_current_admin
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.post("/", response_model=CertificateResponse)
async def create_certificate(
    certificate: CertificateCreate,
    provider: ICertificateRepository = Depends(get_certificate_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    try:
        result = await provider.create_certificate(certificate)
        telemetry_ctx["background_tasks"].add_task(
            telemetry.capture_event,
            distinct_id=telemetry_ctx["ip"],
            event_name="certificate_created",
            properties={
                "certificate_id": result.id if hasattr(result, "id") else None,
                "name": certificate.name,
                "issuing_organization": certificate.issuing_organization,
                "ip": telemetry_ctx["ip"],
                "user_agent": telemetry_ctx["ua"],
            },
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[CertificateResponse])
async def get_certificates(
    skip: int = 0,
    limit: int = 100,
    provider: ICertificateRepository = Depends(get_certificate_repo),
):
    try:
        certificates = await provider.get_all_certificates(skip=skip, limit=limit)
        return certificates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{certificate_id}", response_model=CertificateResponse)
async def update_certificate(
    certificate_id: str,
    certificate: CertificateUpdate,
    provider: ICertificateRepository = Depends(get_certificate_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    updated = await provider.update_certificate(certificate_id, certificate)
    if not updated:
        raise HTTPException(status_code=404, detail="Certificate not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="certificate_updated",
        properties={
            "certificate_id": certificate_id,
            "name": getattr(updated, "name", None),
            "issuing_organization": getattr(updated, "issuing_organization", None),
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return updated


@router.delete("/{certificate_id}")
async def delete_certificate(
    certificate_id: str,
    provider: ICertificateRepository = Depends(get_certificate_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    deleted = await provider.delete_certificate(certificate_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Certificate not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="certificate_deleted",
        properties={
            "certificate_id": certificate_id,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"status": "success"}
