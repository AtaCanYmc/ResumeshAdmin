from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.db.dependencies import get_post_repo
from app.db.repositories import IPostRepository
from app.schemas.post import PostCreate, PostResponse, PostUpdate
from app.services.auth_service import get_current_admin
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    provider: IPostRepository = Depends(get_post_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    result = await provider.create_post(post)
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="post_created",
        properties={
            "post_id": result.id if hasattr(result, "id") else None,
            "title": post.title,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return result


@router.get("/", response_model=List[PostResponse])
async def get_posts(
    skip: int = 0,
    limit: int = 100,
    provider: IPostRepository = Depends(get_post_repo),
):
    return await provider.get_posts(skip=skip, limit=limit)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: str, provider: IPostRepository = Depends(get_post_repo)):
    post = await provider.get_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    post: PostUpdate,
    provider: IPostRepository = Depends(get_post_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    updated = await provider.update_post(post_id, post)
    if not updated:
        raise HTTPException(status_code=404, detail="Post not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="post_updated",
        properties={
            "post_id": post_id,
            "title": getattr(updated, "title", None),
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return updated


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    provider: IPostRepository = Depends(get_post_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    deleted = await provider.delete_post(post_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Post not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="post_deleted",
        properties={
            "post_id": post_id,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"status": "success"}
