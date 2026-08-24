from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db.dependencies import get_video_repo
from app.db.repositories import IVideoRepository
from app.schemas.video import VideoCreate, VideoResponse, VideoUpdate
from app.services.auth_service import get_current_admin
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/videos", tags=["videos"])


@router.post("/", response_model=VideoResponse)
async def create_video(
    video: VideoCreate,
    provider: IVideoRepository = Depends(get_video_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    result = await provider.create_video(video)
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="video_created",
        properties={
            "video_id": result.id if hasattr(result, "id") else None,
            "title": video.title,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return result


@router.get("/", response_model=List[VideoResponse])
async def get_videos(
    skip: int = 0,
    limit: int = 100,
    provider: IVideoRepository = Depends(get_video_repo),
):
    return await provider.get_videos(skip=skip, limit=limit)


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(
    video_id: str, provider: IVideoRepository = Depends(get_video_repo)
):
    video = await provider.get_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.put("/{video_id}", response_model=VideoResponse)
async def update_video(
    video_id: str,
    video: VideoUpdate,
    provider: IVideoRepository = Depends(get_video_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    updated = await provider.update_video(video_id, video)
    if not updated:
        raise HTTPException(status_code=404, detail="Video not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="video_updated",
        properties={
            "video_id": video_id,
            "title": getattr(updated, "title", None),
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return updated


@router.delete("/{video_id}")
async def delete_video(
    video_id: str,
    provider: IVideoRepository = Depends(get_video_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    deleted = await provider.delete_video(video_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Video not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="video_deleted",
        properties={
            "video_id": video_id,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"status": "success"}
