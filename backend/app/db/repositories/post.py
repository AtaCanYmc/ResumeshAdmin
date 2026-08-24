from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.post import PostCreate, PostResponse, PostUpdate


class IPostRepository(ABC):
    @abstractmethod
    async def create_post(self, post: PostCreate) -> PostResponse:
        pass

    @abstractmethod
    async def get_posts(self, skip: int = 0, limit: int = 100) -> List[PostResponse]:
        pass

    @abstractmethod
    async def get_post_by_id(self, post_id: str) -> Optional[PostResponse]:
        pass

    @abstractmethod
    async def upsert_post(self, post: PostCreate) -> PostResponse:
        pass

    @abstractmethod
    async def update_post(
        self, post_id: str, post: PostUpdate
    ) -> Optional[PostResponse]:
        pass

    @abstractmethod
    async def delete_post(self, post_id: str) -> bool:
        pass
