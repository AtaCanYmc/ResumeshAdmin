from typing import List, Optional

from app.db.providers.supabase.client import SupabaseClientManager
from app.db.repositories import IVideoRepository
from app.schemas.video import VideoCreate, VideoResponse, VideoUpdate


class SupabaseVideoRepository(IVideoRepository):
    def __init__(self):
        self.client = SupabaseClientManager.get_client()

    async def create_video(self, video: VideoCreate) -> VideoResponse:
        video_data = video.model_dump(mode="json")
        if "url" in video_data and video_data["url"]:
            video_data["url"] = str(video_data["url"])
        if "thumbnail" in video_data and video_data["thumbnail"]:
            video_data["thumbnail"] = str(video_data["thumbnail"])
        response = await self.client.table("videos").insert(video_data).execute()
        if not response.data:
            raise Exception("Failed to create video in Supabase.")
        return VideoResponse(**response.data[0])

    async def get_videos(self, skip: int = 0, limit: int = 100) -> List[VideoResponse]:
        start = skip
        end = skip + limit - 1
        response = (
            await self.client.table("videos").select("*").range(start, end).execute()
        )
        return [VideoResponse(**item) for item in response.data]

    async def get_video_by_id(self, video_id: str) -> Optional[VideoResponse]:
        response = (
            await self.client.table("videos").select("*").eq("id", video_id).execute()
        )
        if not response.data:
            return None
        return VideoResponse(**response.data[0])

    async def upsert_video(self, video: VideoCreate) -> VideoResponse:
        video_data = video.model_dump(mode="json")
        if "url" in video_data and video_data["url"]:
            video_data["url"] = str(video_data["url"])
        if "thumbnail" in video_data and video_data["thumbnail"]:
            video_data["thumbnail"] = str(video_data["thumbnail"])

        existing = (
            await self.client.table("videos")
            .select("*")
            .eq("url", video_data["url"])
            .execute()
        )
        if existing.data:
            vid_id = existing.data[0]["id"]
            response = (
                await self.client.table("videos")
                .update(video_data)
                .eq("id", vid_id)
                .execute()
            )
        else:
            response = await self.client.table("videos").insert(video_data).execute()
        if not response.data:
            raise Exception("Failed to upsert video in Supabase.")
        return VideoResponse(**response.data[0])

    async def update_video(
        self, video_id: str, video: VideoUpdate
    ) -> Optional[VideoResponse]:
        update_data = video.model_dump(mode="json", exclude_unset=True)
        if "url" in update_data and update_data["url"]:
            update_data["url"] = str(update_data["url"])
        if "thumbnail" in update_data and update_data["thumbnail"]:
            update_data["thumbnail"] = str(update_data["thumbnail"])
        response = (
            await self.client.table("videos")
            .update(update_data)
            .eq("id", video_id)
            .execute()
        )
        if not response.data:
            return None
        return VideoResponse(**response.data[0])

    async def delete_video(self, video_id: str) -> bool:
        response = (
            await self.client.table("videos").delete().eq("id", video_id).execute()
        )
        return len(response.data) > 0
