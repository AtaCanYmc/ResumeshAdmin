from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate


class IProjectRepository(ABC):
    @abstractmethod
    async def create_project(self, project: ProjectCreate) -> ProjectResponse:
        pass

    @abstractmethod
    async def get_projects(
        self, skip: int = 0, limit: int = 100
    ) -> List[ProjectResponse]:
        pass

    @abstractmethod
    async def get_project_by_id(self, project_id: str) -> Optional[ProjectResponse]:
        pass

    @abstractmethod
    async def upsert_project(self, project: ProjectCreate) -> ProjectResponse:
        pass

    @abstractmethod
    async def update_project(
        self, project_id: str, project: ProjectUpdate
    ) -> Optional[ProjectResponse]:
        pass

    @abstractmethod
    async def delete_project(self, project_id: str) -> bool:
        pass
