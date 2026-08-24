from abc import ABC, abstractmethod

from app.schemas.search import GlobalSearchResponse


class ISearchRepository(ABC):
    @abstractmethod
    async def global_search(self, query: str) -> GlobalSearchResponse:
        pass
