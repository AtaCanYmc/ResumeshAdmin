from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.repositories import ISkillRepository
from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillResponse, SkillUpdate


class SQLAlchemySkillRepository(ISkillRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_skills(self, skip: int = 0, limit: int = 100) -> List[SkillResponse]:
        return (
            self.db.query(Skill)
            .order_by(Skill.category, Skill.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    async def get_skill_by_id(self, skill_id: str) -> Optional[SkillResponse]:
        return self.db.query(Skill).filter(Skill.id == skill_id).first()

    async def create_skill(self, skill: SkillCreate) -> SkillResponse:
        db_skill = Skill(**skill.model_dump())
        self.db.add(db_skill)
        self.db.commit()
        self.db.refresh(db_skill)
        return db_skill

    async def update_skill(
        self, skill_id: str, skill: SkillUpdate
    ) -> Optional[SkillResponse]:
        db_skill = await self.get_skill_by_id(skill_id)
        if not db_skill:
            return None
        update_data = skill.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_skill, key, value)
        self.db.commit()
        self.db.refresh(db_skill)
        return db_skill

    async def delete_skill(self, skill_id: str) -> bool:
        db_skill = await self.get_skill_by_id(skill_id)
        if not db_skill:
            return False
        self.db.delete(db_skill)
        self.db.commit()
        return True
