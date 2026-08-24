from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from resumesh_scrapers import NpmScraperService, PyPIScraperService
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.db.dependencies import get_db, get_package_repo
from app.db.repositories import IPackageRepository
from app.schemas.package import PackageCreate, PackageResponse, PackageUpdate
from app.services.auth_service import get_current_admin
from app.services.ingestion_service import IngestionService
from app.services.settings_store import get_setting
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/packages", tags=["packages"])


class PackageRefreshRequest(BaseModel):
    platform: str = "all"
    username: str = ""
    package_names: List[str] = []


@router.post("/refresh", response_model=dict)
async def refresh_packages(
    request: PackageRefreshRequest,
    background_tasks: BackgroundTasks,
    provider: IPackageRepository = Depends(get_package_repo),
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    try:
        ingestion = IngestionService()
        integrations = get_setting(db, "integrations", {}) or {}
        username = (
            request.username
            or integrations.get("github_username")
            or settings.GITHUB_USERNAME
        )

        pypi_user = (
            integrations.get("pypi_username")
            or integrations.get("github_username")
            or settings.GITHUB_USERNAME
        )
        pypi_pkgs = []

        platform_lower = (request.platform or "all").lower()

        if platform_lower in ("all", "npm"):
            scraper_npm = NpmScraperService()
            background_tasks.add_task(
                ingestion.fetch_npm_packages,
                scraper=scraper_npm,
                username=username,
                provider=provider,
            )

        if platform_lower in ("all", "pypi"):
            scraper_pypi = PyPIScraperService()
            background_tasks.add_task(
                ingestion.fetch_pypi_packages,
                scraper=scraper_pypi,
                username=pypi_user,
                provider=provider,
                package_names=pypi_pkgs,
            )

        if platform_lower not in ("all", "npm", "pypi"):
            raise HTTPException(status_code=400, detail="Unsupported platform")

        telemetry_ctx["background_tasks"].add_task(
            telemetry.capture_event,
            distinct_id=telemetry_ctx["ip"],
            event_name="packages_refresh_triggered",
            properties={
                "platform": request.platform,
                "username": request.username,
                "ip": telemetry_ctx["ip"],
                "user_agent": telemetry_ctx["ua"],
            },
        )
        return {
            "status": "processing",
            "message": "Packages ingestion started in background",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=PackageResponse)
async def create_package(
    package: PackageCreate,
    provider: IPackageRepository = Depends(get_package_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    result = await provider.create_package(package)
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="package_created",
        properties={
            "package_id": result.id if hasattr(result, "id") else None,
            "title": package.title,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return result


@router.get("/", response_model=List[PackageResponse])
async def get_packages(
    skip: int = 0,
    limit: int = 100,
    provider: IPackageRepository = Depends(get_package_repo),
):
    return await provider.get_packages(skip=skip, limit=limit)


@router.get("/{package_id}", response_model=PackageResponse)
async def get_package(
    package_id: str, provider: IPackageRepository = Depends(get_package_repo)
):
    package = await provider.get_package_by_id(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package


@router.put("/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: str,
    package: PackageUpdate,
    provider: IPackageRepository = Depends(get_package_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    updated = await provider.update_package(package_id, package)
    if not updated:
        raise HTTPException(status_code=404, detail="Package not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="package_updated",
        properties={
            "package_id": package_id,
            "title": getattr(updated, "title", None),
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return updated


@router.delete("/{package_id}")
async def delete_package(
    package_id: str,
    provider: IPackageRepository = Depends(get_package_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    deleted = await provider.delete_package(package_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Package not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="package_deleted",
        properties={
            "package_id": package_id,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"status": "success"}
