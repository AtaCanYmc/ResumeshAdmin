from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.package import PackageCreate, PackageResponse, PackageUpdate


class IPackageRepository(ABC):
    @abstractmethod
    async def create_package(self, package: PackageCreate) -> PackageResponse:
        pass

    @abstractmethod
    async def get_packages(
        self, skip: int = 0, limit: int = 100
    ) -> List[PackageResponse]:
        pass

    @abstractmethod
    async def get_package_by_id(self, package_id: str) -> Optional[PackageResponse]:
        pass

    @abstractmethod
    async def upsert_package(self, package: PackageCreate) -> PackageResponse:
        pass

    @abstractmethod
    async def update_package(
        self, package_id: str, package: PackageUpdate
    ) -> Optional[PackageResponse]:
        pass

    @abstractmethod
    async def delete_package(self, package_id: str) -> bool:
        pass
