"""
Ingestion Service
==================
Orchestrates platform scraper services and saves the fetched data
to the database via the repository layer.
"""

from typing import Any, Dict, List, Optional

from resumesh_scrapers import IScraperService
from resumesh_scrapers.exceptions import ScraperError

from app.db.repositories import (
    IArticleRepository,
    ICertificateRepository,
    IExperienceRepository,
    IPackageRepository,
    IProjectRepository,
    ISystemLogRepository,
)
from app.schemas.article import ArticleCreate
from app.schemas.package import PackageCreate
from app.schemas.project import ProjectCreate
from app.services.log_service import LogService
from app.services.mappers.linkedin_mapper import LinkedInDataMapper


class IngestionService:
    def __init__(self, log_provider: ISystemLogRepository = None):
        self.log_provider = log_provider

    async def _execute_scraper(
        self,
        scraper: IScraperService,
        upsert_func,
        platform_name: str,
        username: str,
        **kwargs,
    ):
        try:
            items = await scraper.fetch_data(username, **kwargs)
            for item in items:
                await upsert_func(item)
        except ScraperError as exc:
            log_repo = self.log_provider
            await LogService.warning(
                log_repo,
                platform_name,
                f"{platform_name} scraper error: {exc}",
                username,
            )

    async def fetch_github_repos(
        self,
        scraper: IScraperService,
        username: str,
        provider: IProjectRepository,
        pat: Optional[str] = None,
        include_forks: bool = False,
    ):
        """Fetches GitHub repositories and saves via provider."""
        try:
            items = await scraper.fetch_data(
                username, pat=pat, include_forks=include_forks
            )
            for item in items:
                proj = ProjectCreate(
                    name=getattr(item, "name", None) or getattr(item, "title", ""),
                    title=getattr(item, "name", None) or getattr(item, "title", ""),
                    description=getattr(item, "description", None),
                    url=getattr(item, "html_url", None) or getattr(item, "url", None),
                    stars=getattr(item, "stargazers_count", 0)
                    or getattr(item, "stars", 0),
                    watchers=getattr(item, "watchers_count", 0)
                    or getattr(item, "watchers", 0),
                    forks=getattr(item, "forks_count", 0) or getattr(item, "forks", 0),
                    languages=(
                        [item.language]
                        if getattr(item, "language", None)
                        else getattr(item, "languages", [])
                    ),
                    tags=getattr(item, "tags", []),
                    created_at=getattr(item, "created_at", None),
                )
                await provider.upsert_project(proj)
        except ScraperError as exc:
            log_repo = self.log_provider or provider
            await LogService.warning(
                log_repo,
                "GITHUB",
                f"GITHUB scraper error: {exc}",
                username,
            )

    async def fetch_devto_articles(
        self,
        scraper: IScraperService,
        username: str,
        provider: IArticleRepository,
        api_key: Optional[str] = None,
    ):
        """Fetches Dev.to articles and saves via provider."""
        await self._execute_scraper(
            scraper, provider.upsert_article, "DEV_TO", username, api_key=api_key
        )

    async def fetch_medium_articles(
        self,
        scraper: IScraperService,
        username: str,
        provider: IArticleRepository,
    ):
        """Fetches Medium RSS articles and saves via provider."""
        await self._execute_scraper(
            scraper, provider.upsert_article, "MEDIUM", username
        )

    async def fetch_pypi_packages(
        self,
        scraper: IScraperService,
        username: str,
        provider: IPackageRepository,
        package_names: List[str],
    ):
        """Fetches PyPI packages and saves them via provider."""
        try:
            items = await scraper.fetch_data(username, package_names=package_names)
            for item in items:
                info = item.info
                pkg = PackageCreate(
                    title=info.name,
                    description=info.summary or info.description,
                    platform="pypi",
                    url=info.package_url,
                    docs_url=info.docs_url,
                    tags=info.keywords or "",
                    version=info.version,
                    last_month_downloads=(
                        info.downloads.last_month if info.downloads else 0
                    ),
                )
                await provider.upsert_package(pkg)
        except ScraperError as exc:
            log_repo = self.log_provider or provider
            await LogService.warning(
                log_repo,
                "PYPI",
                f"PYPI scraper error: {exc}",
                username,
            )

    async def fetch_npm_packages(
        self,
        scraper: IScraperService,
        username: str,
        provider: IPackageRepository,
    ):
        """Fetches NPM packages and saves them via provider."""
        try:
            results = await scraper.fetch_data(username)
            if not results:
                return
            result = results[0]
            for obj in result.objects:
                pkg_info = obj.package
                pkg = PackageCreate(
                    title=pkg_info.name,
                    description=pkg_info.description,
                    platform="npm",
                    url=pkg_info.links.npm if pkg_info.links else None,
                    docs_url=pkg_info.links.homepage if pkg_info.links else None,
                    tags=",".join(pkg_info.keywords) if pkg_info.keywords else "",
                    version=pkg_info.version,
                    last_month_downloads=obj.downloads.monthly if obj.downloads else 0,
                )
                await provider.upsert_package(pkg)
        except ScraperError as exc:
            log_repo = self.log_provider or provider
            await LogService.warning(
                log_repo,
                "NPM",
                f"NPM scraper error: {exc}",
                username,
            )

    async def fetch_substack_articles(
        self,
        scraper: IScraperService,
        username: str,
        provider: IArticleRepository,
    ):
        """Fetches Substack articles and saves them via provider."""
        try:
            items = await scraper.fetch_data(username)
            for item in items:
                from datetime import datetime, timezone
                from email.utils import parsedate_to_datetime

                try:
                    pub_date = (
                        parsedate_to_datetime(item.published)
                        if item.published
                        else None
                    )
                except Exception:
                    pub_date = datetime.now(timezone.utc)
                art = ArticleCreate(
                    title=item.title,
                    summary=item.summary,
                    platform="SUBSTACK",
                    url=item.link,
                    published_at=pub_date,
                )
                await provider.upsert_article(art)
        except ScraperError as exc:
            log_repo = self.log_provider or provider
            await LogService.warning(
                log_repo,
                "SUBSTACK",
                f"SUBSTACK scraper error: {exc}",
                username,
            )

    async def fetch_behance_projects(
        self,
        scraper: IScraperService,
        username: str,
        provider: IProjectRepository,
        api_key: Optional[str] = None,
    ):
        """Fetches Behance projects and saves them via provider."""
        try:
            items = await scraper.fetch_data(username, api_key=api_key)
            for item in items:
                proj = ProjectCreate(
                    name=item.name,
                    title=item.name,
                    description=(
                        f"Behance Project. Views: {item.stats_views}, "
                        f"Appreciations: {item.stats_appreciations}"
                    ),
                    url=None,
                    stars=item.stats_appreciations,
                    watchers=item.stats_views,
                    forks=0,
                    languages=[],
                    tags=item.tags or [],
                )
                await provider.upsert_project(proj)
        except ScraperError as exc:
            log_repo = self.log_provider or provider
            await LogService.warning(
                log_repo,
                "BEHANCE",
                f"BEHANCE scraper error: {exc}",
                username,
            )

    async def import_linkedin_data(
        self,
        data: Dict[str, Any],
        exp_provider: IExperienceRepository,
        cert_provider: ICertificateRepository,
    ):
        """Processes LinkedIn data package (experiences and certificates)."""
        experiences = LinkedInDataMapper.parse_experiences(data)
        for exp in experiences:
            await exp_provider.create_experience(exp)

        certificates = LinkedInDataMapper.parse_certificates(data)
        for cert in certificates:
            await cert_provider.create_certificate(cert)
