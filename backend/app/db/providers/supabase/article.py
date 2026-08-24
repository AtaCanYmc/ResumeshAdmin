from typing import List, Optional

from app.db.providers.supabase.client import SupabaseClientManager
from app.db.repositories import IArticleRepository
from app.schemas.article import ArticleCreate, ArticleResponse, ArticleUpdate


class SupabaseArticleRepository(IArticleRepository):
    def __init__(self):
        self.client = SupabaseClientManager.get_client()

    async def upsert_article(self, article: ArticleCreate) -> ArticleResponse:
        article_data = article.model_dump(mode="json")
        existing = (
            await self.client.table("articles")
            .select("*")
            .eq("url", article_data["url"])
            .execute()
        )
        if existing.data:
            art_id = existing.data[0]["id"]
            response = (
                await self.client.table("articles")
                .update(article_data)
                .eq("id", art_id)
                .execute()
            )
        else:
            response = (
                await self.client.table("articles").insert(article_data).execute()
            )
        if not response.data:
            raise Exception("Failed to upsert article in Supabase.")
        return ArticleResponse(**response.data[0])

    async def get_all_articles(
        self, skip: int = 0, limit: int = 100
    ) -> List[ArticleResponse]:
        start = skip
        end = skip + limit - 1
        response = (
            await self.client.table("articles").select("*").range(start, end).execute()
        )
        return [ArticleResponse(**item) for item in response.data]

    async def update_article(
        self, article_id: str, article: ArticleUpdate
    ) -> Optional[ArticleResponse]:
        update_data = article.model_dump(mode="json", exclude_unset=True)
        if "url" in update_data and update_data["url"] is not None:
            update_data["url"] = str(update_data["url"])
        response = (
            await self.client.table("articles")
            .update(update_data)
            .eq("id", article_id)
            .execute()
        )
        if not response.data:
            return None
        return ArticleResponse(**response.data[0])

    async def delete_article(self, article_id: str) -> bool:
        response = (
            await self.client.table("articles").delete().eq("id", article_id).execute()
        )
        return len(response.data) > 0
