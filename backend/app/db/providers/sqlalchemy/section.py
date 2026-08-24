import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.repositories import ISectionRepository
from app.models.section import Section
from app.schemas.section import SectionCreate, SectionResponse, SectionUpdate


class SQLAlchemySectionRepository(ISectionRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_sections(
        self, skip: int = 0, limit: int = 100, active_only: bool = False
    ) -> List[SectionResponse]:
        query = self.db.query(Section)
        if active_only:
            query = query.filter(Section.is_active.is_(True))
        return (
            query.order_by(Section.order_index.asc(), Section.created_at.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_section_by_id(self, section_id: str) -> Optional[SectionResponse]:
        return self.db.query(Section).filter(Section.id == section_id).first()

    def get_section_by_key(self, key: str) -> Optional[SectionResponse]:
        return self.db.query(Section).filter(Section.key == key).first()

    def create_section(self, section: SectionCreate) -> SectionResponse:
        data = section.model_dump(exclude_none=True)
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
        db_section = Section(**data)
        self.db.add(db_section)
        self.db.commit()
        self.db.refresh(db_section)
        return db_section

    def update_section(
        self, section_id: str, section: SectionUpdate
    ) -> Optional[SectionResponse]:
        db_section = self.get_section_by_id(section_id) or self.get_section_by_key(
            section_id
        )
        if not db_section:
            return None
        update_data = section.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_section, key, value)
        self.db.commit()
        self.db.refresh(db_section)
        return db_section

    def delete_section(self, section_id: str) -> bool:
        db_section = self.get_section_by_id(section_id) or self.get_section_by_key(
            section_id
        )
        if not db_section:
            return False
        self.db.delete(db_section)
        self.db.commit()
        return True
