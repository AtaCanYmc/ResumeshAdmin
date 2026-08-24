from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.video import VideoCreate, VideoResponse, VideoUpdate


class IVideoRepository(ABC):
    @abstractmethod
    async def create_video(self, video: VideoCreate) -> VideoResponse:
        pass

    @abstractmethod
    async def get_videos(self, skip: int = 0, limit: int = 100) -> List[VideoResponse]:
        pass

    @abstractmethod
    async def get_video_by_id(self, video_id: str) -> Optional[VideoResponse]:
        pass

    @abstractmethod
    async def upsert_video(self, video: VideoCreate) -> VideoResponse:
        pass

    @abstractmethod
    async def update_video(
        self, video_id: str, video: VideoUpdate
    ) -> Optional[VideoResponse]:
        pass

    @abstractmethod
    async def delete_video(self, video_id: str) -> bool:
        pass
