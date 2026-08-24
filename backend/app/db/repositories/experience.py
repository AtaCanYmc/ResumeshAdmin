from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.experience import (
    ExperienceCreate,
    ExperienceResponse,
    ExperienceUpdate,
)


class IExperienceRepository(ABC):
    @abstractmethod
    async def create_experience(
        self, experience: ExperienceCreate
    ) -> ExperienceResponse:
        pass

    @abstractmethod
    async def get_all_experiences(
        self, skip: int = 0, limit: int = 100
    ) -> List[ExperienceResponse]:
        pass

    @abstractmethod
    async def update_experience(
        self, experience_id: str, experience: ExperienceUpdate
    ) -> Optional[ExperienceResponse]:
        pass

    @abstractmethod
    async def delete_experience(self, experience_id: str) -> bool:
        pass
