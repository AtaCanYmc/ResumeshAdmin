from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.system_log import SystemLogCreate, SystemLogResponse


class ISystemLogRepository(ABC):
    @abstractmethod
    async def create_log(self, log: SystemLogCreate) -> SystemLogResponse:
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    async def get_logs_count(
        self,
        level: Optional[str] = None,
        module: Optional[str] = None,
        search_query: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> int:
        pass
