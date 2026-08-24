from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.repositories import IVideoRepository
from app.models.video import Video
from app.schemas.video import VideoCreate, VideoResponse, VideoUpdate


class SQLAlchemyVideoRepository(IVideoRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_videos(self, skip: int = 0, limit: int = 100) -> List[VideoResponse]:
        return (
            self.db.query(Video).order_by(Video.title).offset(skip).limit(limit).all()
        )

    async def get_video_by_id(self, video_id: str) -> Optional[VideoResponse]:
        return self.db.query(Video).filter(Video.id == video_id).first()

    async def create_video(self, video: VideoCreate) -> VideoResponse:
        db_video = Video(**video.model_dump(mode="json"))
        self.db.add(db_video)
        self.db.commit()
        self.db.refresh(db_video)
        return db_video

    async def upsert_video(self, video: VideoCreate) -> VideoResponse:
        db_video = (
            self.db.query(Video)
            .filter(Video.url == str(video.url) if video.url else False)
            .first()
        )
        if db_video:
            update_data = video.model_dump(mode="json", exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_video, key, value)
            self.db.commit()
            self.db.refresh(db_video)
            return db_video
        return await self.create_video(video)

    async def update_video(
        self, video_id: str, video: VideoUpdate
    ) -> Optional[VideoResponse]:
        db_video = await self.get_video_by_id(video_id)
        if not db_video:
            return None
        update_data = video.model_dump(mode="json", exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_video, key, value)
        self.db.commit()
        self.db.refresh(db_video)
        return db_video

    async def delete_video(self, video_id: str) -> bool:
        db_video = await self.get_video_by_id(video_id)
        if not db_video:
            return False
        self.db.delete(db_video)
        self.db.commit()
        return True
