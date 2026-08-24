import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.repositories import ISocialLinkRepository
from app.models.social_link import SocialLink
from app.schemas.social_link import (
    SocialLinkCreate,
    SocialLinkResponse,
    SocialLinkUpdate,
)


class SQLAlchemySocialLinkRepository(ISocialLinkRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_social_links(
        self, skip: int = 0, limit: int = 100, active_only: bool = False
    ) -> List[SocialLinkResponse]:
        query = self.db.query(SocialLink)
        if active_only:
            query = query.filter(SocialLink.is_active.is_(True))
        return (
            query.order_by(SocialLink.order_index.asc(), SocialLink.created_at.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_social_link_by_id(
        self, social_link_id: str
    ) -> Optional[SocialLinkResponse]:
        return self.db.query(SocialLink).filter(SocialLink.id == social_link_id).first()

    def create_social_link(self, social_link: SocialLinkCreate) -> SocialLinkResponse:
        data = social_link.model_dump(exclude_none=True)
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
        db_social_link = SocialLink(**data)
        self.db.add(db_social_link)
        self.db.commit()
        self.db.refresh(db_social_link)
        return db_social_link

    def update_social_link(
        self, social_link_id: str, social_link: SocialLinkUpdate
    ) -> Optional[SocialLinkResponse]:
        db_social_link = self.get_social_link_by_id(social_link_id)
        if not db_social_link:
            return None
        update_data = social_link.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_social_link, key, value)
        self.db.commit()
        self.db.refresh(db_social_link)
        return db_social_link

    def delete_social_link(self, social_link_id: str) -> bool:
        db_social_link = self.get_social_link_by_id(social_link_id)
        if not db_social_link:
            return False
        self.db.delete(db_social_link)
        self.db.commit()
        return True
