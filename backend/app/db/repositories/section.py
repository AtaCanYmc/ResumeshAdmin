from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.section import SectionCreate, SectionResponse, SectionUpdate


class ISectionRepository(ABC):
    @abstractmethod
    def get_sections(
        self, skip: int = 0, limit: int = 100, active_only: bool = False
    ) -> List[SectionResponse]:
        pass

    @abstractmethod
    def get_section_by_id(self, section_id: str) -> Optional[SectionResponse]:
        pass

    @abstractmethod
    def get_section_by_key(self, key: str) -> Optional[SectionResponse]:
        pass

    @abstractmethod
    def create_section(self, section: SectionCreate) -> SectionResponse:
        pass

    @abstractmethod
    def update_section(
        self, section_id: str, section: SectionUpdate
    ) -> Optional[SectionResponse]:
        pass

    @abstractmethod
    def delete_section(self, section_id: str) -> bool:
        pass
