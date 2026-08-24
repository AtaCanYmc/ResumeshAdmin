from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.repositories import IPackageRepository
from app.models.package import Package
from app.schemas.package import PackageCreate, PackageResponse, PackageUpdate


class SQLAlchemyPackageRepository(IPackageRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_packages(
        self, skip: int = 0, limit: int = 100
    ) -> List[PackageResponse]:
        return (
            self.db.query(Package)
            .order_by(Package.title)
            .offset(skip)
            .limit(limit)
            .all()
        )

    async def get_package_by_id(self, package_id: str) -> Optional[PackageResponse]:
        return self.db.query(Package).filter(Package.id == package_id).first()

    async def create_package(self, package: PackageCreate) -> PackageResponse:
        db_package = Package(**package.model_dump(mode="json"))
        self.db.add(db_package)
        self.db.commit()
        self.db.refresh(db_package)
        return db_package

    async def upsert_package(self, package: PackageCreate) -> PackageResponse:
        db_package = (
            self.db.query(Package)
            .filter(
                Package.title == package.title, Package.platform == package.platform
            )
            .first()
        )
        if db_package:
            update_data = package.model_dump(mode="json", exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_package, key, value)
            self.db.commit()
            self.db.refresh(db_package)
            return db_package
        return await self.create_package(package)

    async def update_package(
        self, package_id: str, package: PackageUpdate
    ) -> Optional[PackageResponse]:
        db_package = await self.get_package_by_id(package_id)
        if not db_package:
            return None
        update_data = package.model_dump(mode="json", exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_package, key, value)
        self.db.commit()
        self.db.refresh(db_package)
        return db_package

    async def delete_package(self, package_id: str) -> bool:
        db_package = await self.get_package_by_id(package_id)
        if not db_package:
            return False
        self.db.delete(db_package)
        self.db.commit()
        return True
