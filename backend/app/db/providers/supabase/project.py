from typing import List, Optional

from app.db.providers.supabase.client import SupabaseClientManager
from app.db.repositories import IProjectRepository
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate


class SupabaseProjectRepository(IProjectRepository):
    def __init__(self):
        self.client = SupabaseClientManager.get_client()

    async def create_project(self, project: ProjectCreate) -> ProjectResponse:
        project_data = project.model_dump(mode="json")
        if "name" not in project_data or not project_data["name"]:
            project_data["name"] = getattr(project, "title", None) or getattr(
                project, "name", ""
            )
        valid_keys = {
            "name",
            "description",
            "url",
            "stars",
            "watchers",
            "forks",
            "languages",
            "tags",
            "created_at",
        }
        project_data = {k: v for k, v in project_data.items() if k in valid_keys}

        response = await self.client.table("projects").insert(project_data).execute()
        if not response.data:
            raise Exception("Failed to create project in Supabase.")
        item = response.data[0]
        if "name" not in item or not item["name"]:
            item["name"] = item.get("title", "")
        return ProjectResponse(**item)

    async def get_projects(
        self, skip: int = 0, limit: int = 100
    ) -> List[ProjectResponse]:
        start = skip
        end = skip + limit - 1
        response = (
            await self.client.table("projects").select("*").range(start, end).execute()
        )
        results = []
        for item in response.data:
            if "name" not in item or not item["name"]:
                item["name"] = item.get("title", "")
            results.append(ProjectResponse(**item))
        return results

    async def get_project_by_id(self, project_id: str) -> Optional[ProjectResponse]:
        response = (
            await self.client.table("projects")
            .select("*")
            .eq("id", project_id)
            .execute()
        )
        if not response.data:
            return None
        item = response.data[0]
        if "name" not in item or not item["name"]:
            item["name"] = item.get("title", "")
        return ProjectResponse(**item)

    async def upsert_project(self, project: ProjectCreate) -> ProjectResponse:
        project_data = project.model_dump(mode="json")
        if "name" not in project_data or not project_data["name"]:
            project_data["name"] = getattr(project, "title", None) or getattr(
                project, "name", ""
            )
        if "stars" not in project_data or not project_data["stars"]:
            project_data["stars"] = getattr(project, "stargazers_count", 0)
        if "watchers" not in project_data or not project_data["watchers"]:
            project_data["watchers"] = getattr(project, "watchers_count", 0)
        if "forks" not in project_data or not project_data["forks"]:
            project_data["forks"] = getattr(project, "forks_count", 0)
        if ("url" not in project_data or not project_data["url"]) and getattr(
            project, "url", None
        ):
            project_data["url"] = str(getattr(project, "url"))

        if "url" in project_data and project_data["url"]:
            project_data["url"] = str(project_data["url"])

        valid_keys = {
            "name",
            "description",
            "url",
            "stars",
            "watchers",
            "forks",
            "languages",
            "tags",
            "created_at",
        }
        project_data = {k: v for k, v in project_data.items() if k in valid_keys}

        url = project_data.get("url")
        if url:
            query = self.client.table("projects").select("*").eq("url", url)
        else:
            query = (
                self.client.table("projects")
                .select("*")
                .eq("name", project_data.get("name", ""))
            )

        existing = await query.execute()
        if existing.data:
            proj_id = existing.data[0]["id"]
            response = (
                await self.client.table("projects")
                .update(project_data)
                .eq("id", proj_id)
                .execute()
            )
        else:
            response = (
                await self.client.table("projects").insert(project_data).execute()
            )
        if not response.data:
            raise Exception("Failed to upsert project in Supabase.")
        return ProjectResponse(**response.data[0])

    async def update_project(
        self, project_id: str, project: ProjectUpdate
    ) -> Optional[ProjectResponse]:
        update_data = project.model_dump(mode="json", exclude_unset=True)
        if "v" in update_data and update_data["url"] is not None:
            update_data["url"] = str(update_data["url"])
        response = (
            await self.client.table("projects")
            .update(update_data)
            .eq("id", project_id)
            .execute()
        )
        if not response.data:
            return None
        return ProjectResponse(**response.data[0])

    async def delete_project(self, project_id: str) -> bool:
        response = (
            await self.client.table("projects").delete().eq("id", project_id).execute()
        )
        return len(response.data) > 0
