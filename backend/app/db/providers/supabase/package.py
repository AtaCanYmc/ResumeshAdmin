from typing import List, Optional

from app.db.providers.supabase.client import SupabaseClientManager
from app.db.repositories import IPackageRepository
from app.schemas.package import PackageCreate, PackageResponse, PackageUpdate


class SupabasePackageRepository(IPackageRepository):
    def __init__(self):
        self.client = SupabaseClientManager.get_client()

    async def create_package(self, package: PackageCreate) -> PackageResponse:
        package_data = package.model_dump(mode="json")
        if "url" in package_data and package_data["url"]:
            package_data["url"] = str(package_data["url"])
        if "docs_url" in package_data and package_data["docs_url"]:
            package_data["docs_url"] = str(package_data["docs_url"])
        response = await self.client.table("packages").insert(package_data).execute()
        if not response.data:
            raise Exception("Failed to create package in Supabase.")
        return PackageResponse(**response.data[0])

    async def get_packages(
        self, skip: int = 0, limit: int = 100
    ) -> List[PackageResponse]:
        start = skip
        end = skip + limit - 1
        response = (
            await self.client.table("packages").select("*").range(start, end).execute()
        )
        return [PackageResponse(**item) for item in response.data]

    async def get_package_by_id(self, package_id: str) -> Optional[PackageResponse]:
        response = (
            await self.client.table("packages")
            .select("*")
            .eq("id", package_id)
            .execute()
        )
        if not response.data:
            return None
        return PackageResponse(**response.data[0])

    async def upsert_package(self, package: PackageCreate) -> PackageResponse:
        package_data = package.model_dump(mode="json")
        if "url" in package_data and package_data["url"]:
            package_data["url"] = str(package_data["url"])
        if "docs_url" in package_data and package_data["docs_url"]:
            package_data["docs_url"] = str(package_data["docs_url"])

        existing = (
            await self.client.table("packages")
            .select("*")
            .eq("title", package_data["title"])
            .eq("platform", package_data["platform"])
            .execute()
        )
        if existing.data:
            pkg_id = existing.data[0]["id"]
            response = (
                await self.client.table("packages")
                .update(package_data)
                .eq("id", pkg_id)
                .execute()
            )
        else:
            response = (
                await self.client.table("packages").insert(package_data).execute()
            )
        if not response.data:
            raise Exception("Failed to upsert package in Supabase.")
        return PackageResponse(**response.data[0])

    async def update_package(
        self, package_id: str, package: PackageUpdate
    ) -> Optional[PackageResponse]:
        update_data = package.model_dump(mode="json", exclude_unset=True)
        if "url" in update_data and update_data["url"]:
            update_data["url"] = str(update_data["url"])
        if "docs_url" in update_data and update_data["docs_url"]:
            update_data["docs_url"] = str(update_data["docs_url"])
        response = (
            await self.client.table("packages")
            .update(update_data)
            .eq("id", package_id)
            .execute()
        )
        if not response.data:
            return None
        return PackageResponse(**response.data[0])

    async def delete_package(self, package_id: str) -> bool:
        response = (
            await self.client.table("packages").delete().eq("id", package_id).execute()
        )
        return len(response.data) > 0
