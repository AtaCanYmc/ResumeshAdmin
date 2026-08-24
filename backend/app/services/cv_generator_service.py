import asyncio
from typing import Any

from app.db.repositories import (
    IArticleRepository,
    ICertificateRepository,
    IExperienceRepository,
    IProjectRepository,
)
from app.llm.factory import LLMClient
from app.services.scraper_service import ScraperService


class CVGeneratorService:
    def __init__(
        self,
        project_repo: IProjectRepository,
        experience_repo: IExperienceRepository,
        article_repo: IArticleRepository,
        cert_repo: ICertificateRepository,
        llm_client: Any = None,
    ):
        self.project_repo = project_repo
        self.experience_repo = experience_repo
        self.article_repo = article_repo
        self.cert_repo = cert_repo
        self.llm_client = llm_client

    async def gather_all_data(
        self,
        github_username: str = "",
        devto_username: str = "",
        medium_username: str = "",
        github_pat: str = "",
        devto_api_key: str = "",
    ):
        gh_data, devto_data, medium_data = await asyncio.gather(
            ScraperService.fetch_github_repos(
                github_username, self.project_repo, pat=github_pat
            ),
            ScraperService.fetch_devto_articles(
                devto_username, self.article_repo, api_key=devto_api_key
            ),
            ScraperService.fetch_medium_articles(
                medium_username, self.article_repo
            ),
            return_exceptions=True,
        )

        db_projects = await self.project_repo.get_projects()
        db_exps = await self.experience_repo.get_experiences()
        db_articles = await self.article_repo.get_all_articles()
        db_certs = await self.cert_repo.get_certificates()

        return {
            "projects": [p.model_dump() for p in db_projects],
            "experiences": [e.model_dump() for e in db_exps],
            "articles": [a.model_dump() for a in db_articles],
            "certificates": [c.model_dump() for c in db_certs],
        }

    async def generate_tailored_cv(
        self,
        job_description: str,
        github_username: str = "",
        devto_username: str = "",
        medium_username: str = "",
        github_pat: str = "",
        devto_api_key: str = "",
        skills: Any = None,
    ):
        try:
            from resumesh_llm import CVOptimizer

            optimizer = CVOptimizer(llm_client=self.llm_client)
            tailored = await optimizer.optimize_cv(
                user_data={"skills": skills}, job_description=job_description
            )
            return tailored
        except (ImportError, Exception):
            return {
                "title": "Mocked CV",
                "summary": f"Tailored profile for target role: {job_description}",
                "selected_projects": [],
                "selected_experiences": [],
            }
