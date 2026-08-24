# flake8: noqa: E402
import os

os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["ENABLE_ADMIN_WORKSPACE"] = "true"

import asyncio
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.db.dependencies import (
    get_article_repo,
    get_certificate_repo,
    get_experience_repo,
    get_package_repo,
    get_post_repo,
    get_project_repo,
    get_search_repo,
    get_section_repo,
    get_social_link_repo,
    get_system_log_repo,
    get_video_repo,
)
from app.db.repositories import (
    IArticleRepository,
    ICertificateRepository,
    IExperienceRepository,
    IPackageRepository,
    IPostRepository,
    IProjectRepository,
    ISearchRepository,
    ISectionRepository,
    ISocialLinkRepository,
    ISystemLogRepository,
    IVideoRepository,
)
from app.main import app, limiter
from app.schemas.article import ArticleCreate, ArticleResponse, ArticleUpdate
from app.schemas.certificate import (
    CertificateCreate,
    CertificateResponse,
    CertificateUpdate,
)
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceResponse,
    ExperienceUpdate,
)
from app.schemas.package import PackageCreate, PackageResponse, PackageUpdate
from app.schemas.post import PostCreate, PostResponse, PostUpdate
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.search import GlobalSearchResponse, SearchResultItem
from app.schemas.section import SectionCreate, SectionResponse, SectionUpdate
from app.schemas.social_link import (
    SocialLinkCreate,
    SocialLinkResponse,
    SocialLinkUpdate,
)
from app.schemas.system_log import SystemLogCreate, SystemLogResponse
from app.schemas.video import VideoCreate, VideoResponse, VideoUpdate

limiter.enabled = False

# --- SHARED IN-MEMORY STATE ---
MOCK_DB_STATE = {
    "projects": [],
    "articles": [],
    "experiences": [],
    "certificates": [],
    "logs": [],
    "packages": [],
    "posts": [],
    "videos": [],
    "social_links": [],
    "sections": [],
}


# --- GRANULAR MOCK REPOSITORIES ---
class MockProjectRepository(IProjectRepository):
    async def get_projects(
        self, skip: int = 0, limit: int = 100
    ) -> List[ProjectResponse]:
        return MOCK_DB_STATE["projects"][skip : skip + limit]

    async def get_project_by_id(self, project_id: str) -> Optional[ProjectResponse]:
        for p in MOCK_DB_STATE["projects"]:
            if p.id == project_id:
                return p
        return None

    async def create_project(self, project: ProjectCreate) -> ProjectResponse:
        data = project.model_dump()
        if "title" not in data or not data["title"]:
            data["title"] = getattr(project, "name", None) or getattr(
                project, "title", ""
            )
        if "stars" not in data or not data["stars"]:
            data["stars"] = getattr(project, "stargazers_count", 0)
        if "watchers" not in data or not data["watchers"]:
            data["watchers"] = getattr(project, "watchers_count", 0)
        if "forks" not in data or not data["forks"]:
            data["forks"] = getattr(project, "forks_count", 0)
        if "url" in data and data["url"]:
            data["url"] = str(data["url"])
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        resp = ProjectResponse(**data)
        MOCK_DB_STATE["projects"].append(resp)
        return resp

    async def upsert_project(self, project: ProjectCreate) -> ProjectResponse:
        title = getattr(project, "title", None) or getattr(project, "name", "")
        for i, p in enumerate(MOCK_DB_STATE["projects"]):
            if p.title == title:
                data = project.model_dump()
                if "title" not in data or not data["title"]:
                    data["title"] = title
                if "stars" not in data or not data["stars"]:
                    data["stars"] = getattr(project, "stargazers_count", 0)
                if "watchers" not in data or not data["watchers"]:
                    data["watchers"] = getattr(project, "watchers_count", 0)
                if "forks" not in data or not data["forks"]:
                    data["forks"] = getattr(project, "forks_count", 0)
                if "url" in data and data["url"]:
                    data["url"] = str(data["url"])
                data["id"] = p.id
                data["created_at"] = p.created_at
                data["updated_at"] = datetime.now(timezone.utc)
                resp = ProjectResponse(**data)
                MOCK_DB_STATE["projects"][i] = resp
                return resp
        return await self.create_project(project)

    async def update_project(
        self, project_id: str, project_update: ProjectUpdate
    ) -> Optional[ProjectResponse]:
        for i, p in enumerate(MOCK_DB_STATE["projects"]):
            if p.id == project_id:
                data = p.model_dump()
                for k, v in project_update.model_dump(exclude_unset=True).items():
                    if k == "url" and v:
                        v = str(v)
                    data[k] = v
                data["updated_at"] = datetime.now(timezone.utc)
                resp = ProjectResponse(**data)
                MOCK_DB_STATE["projects"][i] = resp
                return resp
        return None

    async def delete_project(self, project_id: str) -> bool:
        for i, p in enumerate(MOCK_DB_STATE["projects"]):
            if p.id == project_id:
                MOCK_DB_STATE["projects"].pop(i)
                return True
        return False


class MockArticleRepository(IArticleRepository):
    async def get_all_articles(
        self, skip: int = 0, limit: int = 100
    ) -> List[ArticleResponse]:
        return MOCK_DB_STATE["articles"][skip : skip + limit]

    async def create_article(self, article: ArticleCreate) -> ArticleResponse:
        data = article.model_dump()
        if "url" in data and data["url"]:
            data["url"] = str(data["url"])
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        resp = ArticleResponse(**data)
        MOCK_DB_STATE["articles"].append(resp)
        return resp

    async def upsert_article(self, article: ArticleCreate) -> ArticleResponse:
        for i, a in enumerate(MOCK_DB_STATE["articles"]):
            if a.url == str(article.url):
                data = article.model_dump()
                if "url" in data and data["url"]:
                    data["url"] = str(data["url"])
                data["id"] = a.id
                data["created_at"] = a.created_at
                data["updated_at"] = datetime.now(timezone.utc)
                resp = ArticleResponse(**data)
                MOCK_DB_STATE["articles"][i] = resp
                return resp
        return await self.create_article(article)

    async def update_article(
        self, article_id: str, article_update: ArticleUpdate
    ) -> Optional[ArticleResponse]:
        for i, a in enumerate(MOCK_DB_STATE["articles"]):
            if a.id == article_id:
                data = a.model_dump()
                for k, v in article_update.model_dump(exclude_unset=True).items():
                    if k == "url" and v:
                        v = str(v)
                    data[k] = v
                data["updated_at"] = datetime.now(timezone.utc)
                resp = ArticleResponse(**data)
                MOCK_DB_STATE["articles"][i] = resp
                return resp
        return None

    async def delete_article(self, article_id: str) -> bool:
        for i, a in enumerate(MOCK_DB_STATE["articles"]):
            if a.id == article_id:
                MOCK_DB_STATE["articles"].pop(i)
                return True
        return False


class MockExperienceRepository(IExperienceRepository):
    async def get_all_experiences(
        self, skip: int = 0, limit: int = 100
    ) -> List[ExperienceResponse]:
        return MOCK_DB_STATE["experiences"][skip : skip + limit]

    async def create_experience(
        self, experience: ExperienceCreate
    ) -> ExperienceResponse:
        data = experience.model_dump()
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        resp = ExperienceResponse(**data)
        MOCK_DB_STATE["experiences"].append(resp)
        return resp

    async def update_experience(
        self, experience_id: str, experience_update: ExperienceUpdate
    ) -> Optional[ExperienceResponse]:
        for i, exp in enumerate(MOCK_DB_STATE["experiences"]):
            if exp.id == experience_id:
                data = exp.model_dump()
                for k, v in experience_update.model_dump(exclude_unset=True).items():
                    data[k] = v
                data["updated_at"] = datetime.now(timezone.utc)
                resp = ExperienceResponse(**data)
                MOCK_DB_STATE["experiences"][i] = resp
                return resp
        return None

    async def delete_experience(self, experience_id: str) -> bool:
        for i, exp in enumerate(MOCK_DB_STATE["experiences"]):
            if exp.id == experience_id:
                MOCK_DB_STATE["experiences"].pop(i)
                return True
        return False


class MockCertificateRepository(ICertificateRepository):
    async def get_all_certificates(
        self, skip: int = 0, limit: int = 100
    ) -> List[CertificateResponse]:
        return MOCK_DB_STATE["certificates"][skip : skip + limit]

    async def create_certificate(
        self, certificate: CertificateCreate
    ) -> CertificateResponse:
        data = certificate.model_dump()
        if "credential_url" in data and data["credential_url"]:
            data["credential_url"] = str(data["credential_url"])
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        resp = CertificateResponse(**data)
        MOCK_DB_STATE["certificates"].append(resp)
        return resp

    async def update_certificate(
        self, certificate_id: str, certificate_update: CertificateUpdate
    ) -> Optional[CertificateResponse]:
        for i, cert in enumerate(MOCK_DB_STATE["certificates"]):
            if cert.id == certificate_id:
                data = cert.model_dump()
                for k, v in certificate_update.model_dump(exclude_unset=True).items():
                    if k == "credential_url" and v:
                        v = str(v)
                    data[k] = v
                data["updated_at"] = datetime.now(timezone.utc)
                resp = CertificateResponse(**data)
                MOCK_DB_STATE["certificates"][i] = resp
                return resp
        return None

    async def delete_certificate(self, certificate_id: str) -> bool:
        for i, cert in enumerate(MOCK_DB_STATE["certificates"]):
            if cert.id == certificate_id:
                MOCK_DB_STATE["certificates"].pop(i)
                return True
        return False


class MockSystemLogRepository(ISystemLogRepository):
    async def create_log(self, log: SystemLogCreate) -> SystemLogResponse:
        data = log.model_dump()
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        resp = SystemLogResponse(**data)
        MOCK_DB_STATE["logs"].append(resp)
        return resp

    async def get_logs(
        self,
        page: int = 1,
        limit: int = 20,
        level: Optional[str] = None,
        module: Optional[str] = None,
        search_query: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[SystemLogResponse]:
        filtered_logs = MOCK_DB_STATE["logs"]
        if level:
            filtered_logs = [l for l in filtered_logs if l.level == level.upper()]
        if module:
            filtered_logs = [l for l in filtered_logs if l.module == module.upper()]
        if search_query:
            filtered_logs = [
                l for l in filtered_logs if search_query.lower() in l.message.lower()
            ]

        # Sorting desc
        filtered_logs.sort(key=lambda x: x.created_at, reverse=True)

        skip = (page - 1) * limit
        return filtered_logs[skip : skip + limit]

    async def get_logs_count(
        self,
        level: Optional[str] = None,
        module: Optional[str] = None,
        search_query: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> int:
        filtered_logs = MOCK_DB_STATE["logs"]
        if level:
            filtered_logs = [l for l in filtered_logs if l.level == level.upper()]
        if module:
            filtered_logs = [l for l in filtered_logs if l.module == module.upper()]
        if search_query:
            filtered_logs = [
                l for l in filtered_logs if search_query.lower() in l.message.lower()
            ]
        return len(filtered_logs)


class MockSearchRepository(ISearchRepository):
    async def global_search(self, query: str) -> GlobalSearchResponse:
        projects = []
        for p in MOCK_DB_STATE["projects"]:
            if query.lower() in p.title.lower() or (
                p.description and query.lower() in p.description.lower()
            ):
                projects.append(
                    SearchResultItem(
                        id=p.id,
                        title=p.title,
                        subtitle=(p.description[:100] if p.description else None),
                        url=(str(p.url) if p.url else None),
                        tags=p.languages + p.tags,
                    )
                )

        articles = []
        for a in MOCK_DB_STATE["articles"]:
            if query.lower() in a.title.lower() or (
                a.summary and query.lower() in a.summary.lower()
            ):
                url_val = str(a.url) if a.url else None
                articles.append(
                    SearchResultItem(
                        id=a.id,
                        title=a.title,
                        subtitle=a.summary[:100] if a.summary else None,
                        url=url_val,
                        tags=[],
                        date=(
                            a.published_at.strftime("%Y-%m-%d")
                            if a.published_at
                            else None
                        ),
                    )
                )

        return GlobalSearchResponse(
            query=query,
            projects=projects,
            articles=articles,
            experiences=[],
            certificates=[],
        )


class MockPackageRepository(IPackageRepository):
    async def get_packages(
        self, skip: int = 0, limit: int = 100
    ) -> List[PackageResponse]:
        return MOCK_DB_STATE["packages"][skip : skip + limit]

    async def get_package_by_id(self, package_id: str) -> Optional[PackageResponse]:
        for p in MOCK_DB_STATE["packages"]:
            if p.id == package_id:
                return p
        return None

    async def create_package(self, package: PackageCreate) -> PackageResponse:
        data = package.model_dump()
        if "url" in data and data["url"]:
            data["url"] = str(data["url"])
        if "docs_url" in data and data["docs_url"]:
            data["docs_url"] = str(data["docs_url"])
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        resp = PackageResponse(**data)
        MOCK_DB_STATE["packages"].append(resp)
        return resp

    async def upsert_package(self, package: PackageCreate) -> PackageResponse:
        for i, p in enumerate(MOCK_DB_STATE["packages"]):
            if p.title == package.title and p.platform == package.platform:
                data = package.model_dump()
                if "url" in data and data["url"]:
                    data["url"] = str(data["url"])
                if "docs_url" in data and data["docs_url"]:
                    data["docs_url"] = str(data["docs_url"])
                data["id"] = p.id
                data["created_at"] = p.created_at
                data["updated_at"] = datetime.now(timezone.utc)
                resp = PackageResponse(**data)
                MOCK_DB_STATE["packages"][i] = resp
                return resp
        return await self.create_package(package)

    async def update_package(
        self, package_id: str, package_update: PackageUpdate
    ) -> Optional[PackageResponse]:
        for i, p in enumerate(MOCK_DB_STATE["packages"]):
            if p.id == package_id:
                data = p.model_dump()
                for k, v in package_update.model_dump(exclude_unset=True).items():
                    if k in ("url", "docs_url") and v:
                        v = str(v)
                    data[k] = v
                data["updated_at"] = datetime.now(timezone.utc)
                resp = PackageResponse(**data)
                MOCK_DB_STATE["packages"][i] = resp
                return resp
        return None

    async def delete_package(self, package_id: str) -> bool:
        for i, p in enumerate(MOCK_DB_STATE["packages"]):
            if p.id == package_id:
                MOCK_DB_STATE["packages"].pop(i)
                return True
        return False


class MockPostRepository(IPostRepository):
    async def get_posts(self, skip: int = 0, limit: int = 100) -> List[PostResponse]:
        return MOCK_DB_STATE["posts"][skip : skip + limit]

    async def get_post_by_id(self, post_id: str) -> Optional[PostResponse]:
        for p in MOCK_DB_STATE["posts"]:
            if p.id == post_id:
                return p
        return None

    async def create_post(self, post: PostCreate) -> PostResponse:
        data = post.model_dump()
        if "url" in data and data["url"]:
            data["url"] = str(data["url"])
        if "thumbnail" in data and data["thumbnail"]:
            data["thumbnail"] = str(data["thumbnail"])
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        resp = PostResponse(**data)
        MOCK_DB_STATE["posts"].append(resp)
        return resp

    async def upsert_post(self, post: PostCreate) -> PostResponse:
        for i, p in enumerate(MOCK_DB_STATE["posts"]):
            if p.url == str(post.url):
                data = post.model_dump()
                if "url" in data and data["url"]:
                    data["url"] = str(data["url"])
                if "thumbnail" in data and data["thumbnail"]:
                    data["thumbnail"] = str(data["thumbnail"])
                data["id"] = p.id
                data["created_at"] = p.created_at
                data["updated_at"] = datetime.now(timezone.utc)
                resp = PostResponse(**data)
                MOCK_DB_STATE["posts"][i] = resp
                return resp
        return await self.create_post(post)

    async def update_post(
        self, post_id: str, post_update: PostUpdate
    ) -> Optional[PostResponse]:
        for i, p in enumerate(MOCK_DB_STATE["posts"]):
            if p.id == post_id:
                data = p.model_dump()
                for k, v in post_update.model_dump(exclude_unset=True).items():
                    if k in ("url", "thumbnail") and v:
                        v = str(v)
                    data[k] = v
                data["updated_at"] = datetime.now(timezone.utc)
                resp = PostResponse(**data)
                MOCK_DB_STATE["posts"][i] = resp
                return resp
        return None

    async def delete_post(self, post_id: str) -> bool:
        for i, p in enumerate(MOCK_DB_STATE["posts"]):
            if p.id == post_id:
                MOCK_DB_STATE["posts"].pop(i)
                return True
        return False


class MockVideoRepository(IVideoRepository):
    async def get_videos(self, skip: int = 0, limit: int = 100) -> List[VideoResponse]:
        return MOCK_DB_STATE["videos"][skip : skip + limit]

    async def get_video_by_id(self, video_id: str) -> Optional[VideoResponse]:
        for v in MOCK_DB_STATE["videos"]:
            if v.id == video_id:
                return v
        return None

    async def create_video(self, video: VideoCreate) -> VideoResponse:
        data = video.model_dump()
        if "url" in data and data["url"]:
            data["url"] = str(data["url"])
        if "thumbnail" in data and data["thumbnail"]:
            data["thumbnail"] = str(data["thumbnail"])
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        resp = VideoResponse(**data)
        MOCK_DB_STATE["videos"].append(resp)
        return resp

    async def upsert_video(self, video: VideoCreate) -> VideoResponse:
        for i, v in enumerate(MOCK_DB_STATE["videos"]):
            if v.url == str(video.url):
                data = video.model_dump()
                if "url" in data and data["url"]:
                    data["url"] = str(data["url"])
                if "thumbnail" in data and data["thumbnail"]:
                    data["thumbnail"] = str(data["thumbnail"])
                data["id"] = v.id
                data["created_at"] = v.created_at
                data["updated_at"] = datetime.now(timezone.utc)
                resp = VideoResponse(**data)
                MOCK_DB_STATE["videos"][i] = resp
                return resp
        return await self.create_video(video)

    async def update_video(
        self, video_id: str, video_update: VideoUpdate
    ) -> Optional[VideoResponse]:
        for i, v in enumerate(MOCK_DB_STATE["videos"]):
            if v.id == video_id:
                data = v.model_dump()
                for k, v_val in video_update.model_dump(exclude_unset=True).items():
                    if k in ("url", "thumbnail") and v_val:
                        v_val = str(v_val)
                    data[k] = v_val
                data["updated_at"] = datetime.now(timezone.utc)
                resp = VideoResponse(**data)
                MOCK_DB_STATE["videos"][i] = resp
                return resp
        return None

    async def delete_video(self, video_id: str) -> bool:
        for i, v in enumerate(MOCK_DB_STATE["videos"]):
            if v.id == video_id:
                MOCK_DB_STATE["videos"].pop(i)
                return True
        return False


class MockSocialLinkRepository(ISocialLinkRepository):
    def get_social_links(
        self, skip: int = 0, limit: int = 100, active_only: bool = False
    ) -> List[SocialLinkResponse]:
        links = MOCK_DB_STATE["social_links"]
        if active_only:
            links = [l for l in links if l.is_active]
        return links[skip : skip + limit]

    def get_social_link_by_id(
        self, social_link_id: str
    ) -> Optional[SocialLinkResponse]:
        for l in MOCK_DB_STATE["social_links"]:
            if l.id == social_link_id:
                return l
        return None

    def create_social_link(self, social_link: SocialLinkCreate) -> SocialLinkResponse:
        data = social_link.model_dump()
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        resp = SocialLinkResponse(**data)
        MOCK_DB_STATE["social_links"].append(resp)
        return resp

    def update_social_link(
        self, social_link_id: str, social_link: SocialLinkUpdate
    ) -> Optional[SocialLinkResponse]:
        for i, l in enumerate(MOCK_DB_STATE["social_links"]):
            if l.id == social_link_id:
                data = l.model_dump()
                for k, v in social_link.model_dump(exclude_unset=True).items():
                    data[k] = v
                data["updated_at"] = datetime.now(timezone.utc)
                resp = SocialLinkResponse(**data)
                MOCK_DB_STATE["social_links"][i] = resp
                return resp
        return None

    def delete_social_link(self, social_link_id: str) -> bool:
        for i, l in enumerate(MOCK_DB_STATE["social_links"]):
            if l.id == social_link_id:
                MOCK_DB_STATE["social_links"].pop(i)
                return True
        return False


class MockSectionRepository(ISectionRepository):
    def get_sections(
        self, skip: int = 0, limit: int = 100, active_only: bool = False
    ) -> List[SectionResponse]:
        sections = MOCK_DB_STATE["sections"]
        if active_only:
            sections = [s for s in sections if s.is_active]
        return sections[skip : skip + limit]

    def get_section_by_id(self, section_id: str) -> Optional[SectionResponse]:
        for s in MOCK_DB_STATE["sections"]:
            if s.id == section_id:
                return s
        return None

    def get_section_by_key(self, key: str) -> Optional[SectionResponse]:
        for s in MOCK_DB_STATE["sections"]:
            if s.key == key:
                return s
        return None

    def create_section(self, section: SectionCreate) -> SectionResponse:
        data = section.model_dump()
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        resp = SectionResponse(**data)
        MOCK_DB_STATE["sections"].append(resp)
        return resp

    def update_section(
        self, section_id: str, section: SectionUpdate
    ) -> Optional[SectionResponse]:
        for i, s in enumerate(MOCK_DB_STATE["sections"]):
            if s.id == section_id or s.key == section_id:
                data = s.model_dump()
                for k, v in section.model_dump(exclude_unset=True).items():
                    data[k] = v
                data["updated_at"] = datetime.now(timezone.utc)
                resp = SectionResponse(**data)
                MOCK_DB_STATE["sections"][i] = resp
                return resp
        return None

    def delete_section(self, section_id: str) -> bool:
        for i, s in enumerate(MOCK_DB_STATE["sections"]):
            if s.id == section_id or s.key == section_id:
                MOCK_DB_STATE["sections"].pop(i)
                return True
        return False


# --- WRAPPER FOR BACKWARD COMPATIBILITY IN TESTS ---
class MockProviderWrapper:
    """Wrapper that combines the mocks for test backwards compatibility"""

    def __init__(self):
        self.project_repo = MockProjectRepository()
        self.article_repo = MockArticleRepository()
        self.exp_repo = MockExperienceRepository()
        self.cert_repo = MockCertificateRepository()
        self.log_repo = MockSystemLogRepository()
        self.search_repo = MockSearchRepository()
        self.package_repo = MockPackageRepository()
        self.post_repo = MockPostRepository()
        self.video_repo = MockVideoRepository()
        self.social_link_repo = MockSocialLinkRepository()
        self.section_repo = MockSectionRepository()

    # Delegate methods to inner repos
    async def create_project(self, project):
        return await self.project_repo.create_project(project)

    async def upsert_project(self, project):
        return await self.project_repo.upsert_project(project)

    async def get_projects(self):
        return await self.project_repo.get_projects()

    async def create_log(self, log):
        return await self.log_repo.create_log(log)

    async def get_logs(self, **kwargs):
        return await self.log_repo.get_logs(**kwargs)

    async def create_article(self, article):
        return await self.article_repo.create_article(article)

    async def upsert_article(self, article):
        return await self.article_repo.upsert_article(article)

    async def get_all_articles(self):
        return await self.article_repo.get_all_articles()

    async def upsert_package(self, package):
        return await self.package_repo.upsert_package(package)

    async def get_packages(self):
        return await self.package_repo.get_packages()

    async def upsert_post(self, post):
        return await self.post_repo.upsert_post(post)

    async def get_posts(self):
        return await self.post_repo.get_posts()

    async def upsert_video(self, video):
        return await self.video_repo.upsert_video(video)

    async def get_videos(self):
        return await self.video_repo.get_videos()


@pytest.fixture(scope="session")
def event_loop():
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
def clean_mock_state():
    """Temiz bir state sağlar"""
    MOCK_DB_STATE["projects"].clear()
    MOCK_DB_STATE["articles"].clear()
    MOCK_DB_STATE["experiences"].clear()
    MOCK_DB_STATE["certificates"].clear()
    MOCK_DB_STATE["logs"].clear()
    MOCK_DB_STATE["packages"].clear()
    MOCK_DB_STATE["posts"].clear()
    MOCK_DB_STATE["videos"].clear()
    MOCK_DB_STATE["social_links"].clear()
    MOCK_DB_STATE["sections"].clear()


@pytest.fixture
def mock_provider():
    return MockProviderWrapper()


@pytest_asyncio.fixture
async def client(mock_provider):
    """FastAPI istemcisi döner, bağımlılıkları granular mocklar ile ezer."""
    from unittest.mock import MagicMock

    mock_db = MagicMock()
    mock_db.query.return_value.all.return_value = []

    from app.db.dependencies import get_db

    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_project_repo] = lambda: mock_provider.project_repo
    app.dependency_overrides[get_article_repo] = lambda: mock_provider.article_repo
    app.dependency_overrides[get_experience_repo] = lambda: mock_provider.exp_repo
    app.dependency_overrides[get_certificate_repo] = lambda: mock_provider.cert_repo
    app.dependency_overrides[get_system_log_repo] = lambda: mock_provider.log_repo
    app.dependency_overrides[get_search_repo] = lambda: mock_provider.search_repo
    app.dependency_overrides[get_package_repo] = lambda: mock_provider.package_repo
    app.dependency_overrides[get_post_repo] = lambda: mock_provider.post_repo
    app.dependency_overrides[get_video_repo] = lambda: mock_provider.video_repo
    app.dependency_overrides[get_social_link_repo] = (
        lambda: mock_provider.social_link_repo
    )
    app.dependency_overrides[get_section_repo] = lambda: mock_provider.section_repo

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
