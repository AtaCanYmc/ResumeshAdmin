from typing import List, Optional

from pydantic import BaseModel


class SearchResultItem(BaseModel):
    id: str  # Kept as str to be agnostic
    title: str
    subtitle: Optional[str] = None
    url: Optional[str] = None
    tags: List[str] = []
    date: Optional[str] = None


class GlobalSearchResponse(BaseModel):
    query: str
    projects: List[SearchResultItem]
    articles: List[SearchResultItem]
    experiences: List[SearchResultItem]
    certificates: List[SearchResultItem]
