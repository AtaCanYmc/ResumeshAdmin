from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.skill import SkillCreate, SkillResponse, SkillUpdate


class ISkillRepository(ABC):
    @abstractmethod
    async def get_skills(self, skip: int = 0, limit: int = 100) -> List[SkillResponse]:
        pass

    @abstractmethod
    async def get_skill_by_id(self, skill_id: str) -> Optional[SkillResponse]:
        pass

    @abstractmethod
    async def create_skill(self, skill: SkillCreate) -> SkillResponse:
        pass

    @abstractmethod
    async def update_skill(
        self, skill_id: str, skill: SkillUpdate
    ) -> Optional[SkillResponse]:
        pass

    @abstractmethod
    async def delete_skill(self, skill_id: str) -> bool:
        pass
