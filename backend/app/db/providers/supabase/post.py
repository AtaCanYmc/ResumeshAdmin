from typing import List, Optional

from app.db.providers.supabase.client import SupabaseClientManager
from app.db.repositories import IPostRepository
from app.schemas.post import PostCreate, PostResponse, PostUpdate


class SupabasePostRepository(IPostRepository):
    def __init__(self):
        self.client = SupabaseClientManager.get_client()

    async def create_post(self, post: PostCreate) -> PostResponse:
        post_data = post.model_dump(mode="json")
        if "url" in post_data and post_data["url"]:
            post_data["url"] = str(post_data["url"])
        if "thumbnail" in post_data and post_data["thumbnail"]:
            post_data["thumbnail"] = str(post_data["thumbnail"])
        response = await self.client.table("posts").insert(post_data).execute()
        if not response.data:
            raise Exception("Failed to create post in Supabase.")
        return PostResponse(**response.data[0])

    async def get_posts(self, skip: int = 0, limit: int = 100) -> List[PostResponse]:
        start = skip
        end = skip + limit - 1
        response = (
            await self.client.table("posts").select("*").range(start, end).execute()
        )
        return [PostResponse(**item) for item in response.data]

    async def get_post_by_id(self, post_id: str) -> Optional[PostResponse]:
        response = (
            await self.client.table("posts").select("*").eq("id", post_id).execute()
        )
        if not response.data:
            return None
        return PostResponse(**response.data[0])

    async def upsert_post(self, post: PostCreate) -> PostResponse:
        post_data = post.model_dump(mode="json")
        if "url" in post_data and post_data["url"]:
            post_data["url"] = str(post_data["url"])
        if "thumbnail" in post_data and post_data["thumbnail"]:
            post_data["thumbnail"] = str(post_data["thumbnail"])

        existing = (
            await self.client.table("posts")
            .select("*")
            .eq("url", post_data["url"])
            .execute()
        )
        if existing.data:
            pst_id = existing.data[0]["id"]
            response = (
                await self.client.table("posts")
                .update(post_data)
                .eq("id", pst_id)
                .execute()
            )
        else:
            response = await self.client.table("posts").insert(post_data).execute()
        if not response.data:
            raise Exception("Failed to upsert post in Supabase.")
        return PostResponse(**response.data[0])

    async def update_post(
        self, post_id: str, post: PostUpdate
    ) -> Optional[PostResponse]:
        update_data = post.model_dump(mode="json", exclude_unset=True)
        if "url" in update_data and update_data["url"]:
            update_data["url"] = str(update_data["url"])
        if "thumbnail" in update_data and update_data["thumbnail"]:
            update_data["thumbnail"] = str(update_data["thumbnail"])
        response = (
            await self.client.table("posts")
            .update(update_data)
            .eq("id", post_id)
            .execute()
        )
        if not response.data:
            return None
        return PostResponse(**response.data[0])

    async def delete_post(self, post_id: str) -> bool:
        response = await self.client.table("posts").delete().eq("id", post_id).execute()
        return len(response.data) > 0
