from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.article import ArticleCreate, ArticleResponse, ArticleUpdate


class IArticleRepository(ABC):
    @abstractmethod
    async def upsert_article(self, article: ArticleCreate) -> ArticleResponse:
        pass

    @abstractmethod
    async def get_all_articles(
        self, skip: int = 0, limit: int = 100
    ) -> List[ArticleResponse]:
        pass

    @abstractmethod
    async def update_article(
        self, article_id: str, article: ArticleUpdate
    ) -> Optional[ArticleResponse]:
        pass

    @abstractmethod
    async def delete_article(self, article_id: str) -> bool:
        pass
