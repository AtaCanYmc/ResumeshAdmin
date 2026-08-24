from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.repositories import IPostRepository
from app.models.post import Post
from app.schemas.post import PostCreate, PostResponse, PostUpdate


class SQLAlchemyPostRepository(IPostRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_posts(self, skip: int = 0, limit: int = 100) -> List[PostResponse]:
        return self.db.query(Post).order_by(Post.title).offset(skip).limit(limit).all()

    async def get_post_by_id(self, post_id: str) -> Optional[PostResponse]:
        return self.db.query(Post).filter(Post.id == post_id).first()

    async def create_post(self, post: PostCreate) -> PostResponse:
        db_post = Post(**post.model_dump(mode="json"))
        self.db.add(db_post)
        self.db.commit()
        self.db.refresh(db_post)
        return db_post

    async def upsert_post(self, post: PostCreate) -> PostResponse:
        db_post = (
            self.db.query(Post)
            .filter(Post.url == str(post.url) if post.url else False)
            .first()
        )
        if db_post:
            update_data = post.model_dump(mode="json", exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_post, key, value)
            self.db.commit()
            self.db.refresh(db_post)
            return db_post
        return await self.create_post(post)

    async def update_post(
        self, post_id: str, post: PostUpdate
    ) -> Optional[PostResponse]:
        db_post = await self.get_post_by_id(post_id)
        if not db_post:
            return None
        update_data = post.model_dump(mode="json", exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_post, key, value)
        self.db.commit()
        self.db.refresh(db_post)
        return db_post

    async def delete_post(self, post_id: str) -> bool:
        db_post = await self.get_post_by_id(post_id)
        if not db_post:
            return False
        self.db.delete(db_post)
        self.db.commit()
        return True
