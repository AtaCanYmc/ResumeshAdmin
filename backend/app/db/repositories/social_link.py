from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.social_link import (
    SocialLinkCreate,
    SocialLinkResponse,
    SocialLinkUpdate,
)


class ISocialLinkRepository(ABC):
    @abstractmethod
    def get_social_links(
        self, skip: int = 0, limit: int = 100, active_only: bool = False
    ) -> List[SocialLinkResponse]:
        pass

    @abstractmethod
    def get_social_link_by_id(
        self, social_link_id: str
    ) -> Optional[SocialLinkResponse]:
        pass

    @abstractmethod
    def create_social_link(self, social_link: SocialLinkCreate) -> SocialLinkResponse:
        pass

    @abstractmethod
    def update_social_link(
        self, social_link_id: str, social_link: SocialLinkUpdate
    ) -> Optional[SocialLinkResponse]:
        pass

    @abstractmethod
    def delete_social_link(self, social_link_id: str) -> bool:
        pass
