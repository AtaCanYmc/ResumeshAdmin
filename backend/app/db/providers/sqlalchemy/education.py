from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.repositories import IEducationRepository
from app.models.education import Education
from app.schemas.education import EducationCreate, EducationResponse, EducationUpdate


class SQLAlchemyEducationRepository(IEducationRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_educations(
        self, skip: int = 0, limit: int = 100
    ) -> List[EducationResponse]:
        return (
            self.db.query(Education)
            .order_by(Education.start_date.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    async def get_education_by_id(
        self, education_id: str
    ) -> Optional[EducationResponse]:
        return self.db.query(Education).filter(Education.id == education_id).first()

    async def create_education(self, education: EducationCreate) -> EducationResponse:
        db_education = Education(**education.model_dump())
        self.db.add(db_education)
        self.db.commit()
        self.db.refresh(db_education)
        return db_education

    async def update_education(
        self, education_id: str, education: EducationUpdate
    ) -> Optional[EducationResponse]:
        db_education = await self.get_education_by_id(education_id)
        if not db_education:
            return None
        update_data = education.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_education, key, value)
        self.db.commit()
        self.db.refresh(db_education)
        return db_education

    async def delete_education(self, education_id: str) -> bool:
        db_education = await self.get_education_by_id(education_id)
        if not db_education:
            return False
        self.db.delete(db_education)
        self.db.commit()
        return True
