from typing import List, Optional

from app.db.providers.supabase.client import SupabaseClientManager
from app.db.repositories import IExperienceRepository
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceResponse,
    ExperienceUpdate,
)


class SupabaseExperienceRepository(IExperienceRepository):
    def __init__(self):
        self.client = SupabaseClientManager.get_client()

    async def create_experience(
        self, experience: ExperienceCreate
    ) -> ExperienceResponse:
        exp_data = experience.model_dump(mode="json")
        response = await self.client.table("experiences").insert(exp_data).execute()
        if not response.data:
            raise Exception("Failed to create experience in Supabase.")
        return ExperienceResponse(**response.data[0])

    async def get_all_experiences(
        self, skip: int = 0, limit: int = 100
    ) -> List[ExperienceResponse]:
        start = skip
        end = skip + limit - 1
        response = (
            await self.client.table("experiences")
            .select("*")
            .range(start, end)
            .execute()
        )
        return [ExperienceResponse(**item) for item in response.data]

    async def update_experience(
        self, experience_id: str, experience: ExperienceUpdate
    ) -> Optional[ExperienceResponse]:
        update_data = experience.model_dump(mode="json", exclude_unset=True)
        response = (
            await self.client.table("experiences")
            .update(update_data)
            .eq("id", experience_id)
            .execute()
        )
        if not response.data:
            return None
        return ExperienceResponse(**response.data[0])

    async def delete_experience(self, experience_id: str) -> bool:
        response = (
            await self.client.table("experiences")
            .delete()
            .eq("id", experience_id)
            .execute()
        )
        return len(response.data) > 0
