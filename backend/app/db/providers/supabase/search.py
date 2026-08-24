import asyncio

from app.db.providers.supabase.client import SupabaseClientManager
from app.db.repositories import ISearchRepository
from app.schemas.search import GlobalSearchResponse, SearchResultItem


class SupabaseSearchRepository(ISearchRepository):
    def __init__(self):
        self.client = SupabaseClientManager.get_client()

    async def global_search(self, query: str) -> GlobalSearchResponse:
        search_term = f"ilike.%{query}%"

        tasks = [
            self.client.table("projects")
            .select("*")
            .or_(f"name.{search_term},description.{search_term}")
            .execute(),
            self.client.table("articles")
            .select("*")
            .or_(f"title.{search_term},summary.{search_term}")
            .execute(),
            self.client.table("experiences")
            .select("*")
            .or_(f"title.{search_term},company_name.{search_term}")
            .execute(),
            self.client.table("certificates")
            .select("*")
            .or_(f"name.{search_term},issuing_organization.{search_term}")
            .execute(),
        ]

        projects_res, articles_res, experiences_res, certificates_res = (
            await asyncio.gather(*tasks)
        )

        projects = [
            SearchResultItem(
                id=str(p["id"]),
                title=p.get("name") or p.get("title", ""),
                subtitle=p.get("description")[:100] if p.get("description") else None,
                url=p.get("url"),
                tags=p.get("languages", []) + p.get("tags", []),
            )
            for p in projects_res.data
        ]

        articles = [
            SearchResultItem(
                id=str(a["id"]),
                title=a["title"],
                subtitle=a.get("summary")[:100] if a.get("summary") else None,
                url=a.get("url"),
                tags=[],
                date=a.get("published_at"),
            )
            for a in articles_res.data
        ]

        experiences = [
            SearchResultItem(
                id=str(e["id"]),
                title=e["title"],
                subtitle=e.get("company_name"),
                url=None,
                tags=[],
                date=f"{e.get('start_date')} - {e.get('end_date') or 'Present'}",
            )
            for e in experiences_res.data
        ]

        certificates = [
            SearchResultItem(
                id=str(c["id"]),
                title=c["name"],
                subtitle=c.get("issuing_organization"),
                url=c.get("credential_url"),
                tags=[],
                date=c.get("issue_date"),
            )
            for c in certificates_res.data
        ]

        return GlobalSearchResponse(
            query=query,
            projects=projects,
            articles=articles,
            experiences=experiences,
            certificates=certificates,
        )
