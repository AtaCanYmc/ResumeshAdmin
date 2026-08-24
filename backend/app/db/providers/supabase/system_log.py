from typing import List, Optional

from app.db.providers.supabase.client import SupabaseClientManager
from app.db.repositories import ISystemLogRepository
from app.schemas.system_log import SystemLogCreate, SystemLogResponse


class SupabaseSystemLogRepository(ISystemLogRepository):
    def __init__(self):
        self.client = SupabaseClientManager.get_client()

    async def create_log(self, log: SystemLogCreate) -> SystemLogResponse:
        log_data = log.model_dump(mode="json")
        response = await self.client.table("system_logs").insert(log_data).execute()
        if not response.data:
            raise Exception("Failed to create system log in Supabase.")
        return SystemLogResponse(**response.data[0])

    async def get_logs(
        self,
        page: int = 1,
        limit: int = 20,
        level: Optional[str] = None,
        module: Optional[str] = None,
        search_query: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[SystemLogResponse]:
        skip = (page - 1) * limit
        start = skip
        end = skip + limit - 1
        query = self.client.table("system_logs").select("*")
        if level:
            query = query.eq("level", level.upper())
        if module:
            query = query.eq("module", module.upper())
        if search_query:
            query = query.ilike("message", f"%{search_query}%")
        if start_date:
            query = query.gte("created_at", start_date)
        if end_date:
            query = query.lte("created_at", end_date)

        response = (
            await query.order("created_at", desc=True).range(start, end).execute()
        )
        return [SystemLogResponse(**item) for item in response.data]

    async def get_logs_count(
        self,
        level: Optional[str] = None,
        module: Optional[str] = None,
        search_query: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> int:
        query = self.client.table("system_logs").select("id", count="exact")
        if level:
            query = query.eq("level", level.upper())
        if module:
            query = query.eq("module", module.upper())
        if search_query:
            query = query.ilike("message", f"%{search_query}%")
        if start_date:
            query = query.gte("created_at", start_date)
        if end_date:
            query = query.lte("created_at", end_date)

        response = await query.execute()
        return response.count if response.count is not None else 0
