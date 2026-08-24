from app.db.providers.supabase import (
    SupabaseArticleRepository,
    SupabaseCertificateRepository,
    SupabaseExperienceRepository,
    SupabasePackageRepository,
    SupabasePostRepository,
    SupabaseProjectRepository,
    SupabaseSearchRepository,
    SupabaseSystemLogRepository,
    SupabaseVideoRepository,
)
from app.db.repositories import (
    IArticleRepository,
    ICertificateRepository,
    IExperienceRepository,
    IPackageRepository,
    IPostRepository,
    IProjectRepository,
    ISearchRepository,
    ISystemLogRepository,
    IVideoRepository,
)


class RepositoryFactory:
    _instances = {}

    @classmethod
    def get_project_repository(cls) -> IProjectRepository:
        if "project" not in cls._instances:
            cls._instances["project"] = SupabaseProjectRepository()
        return cls._instances["project"]

    @classmethod
    def get_article_repository(cls) -> IArticleRepository:
        if "article" not in cls._instances:
            cls._instances["article"] = SupabaseArticleRepository()
        return cls._instances["article"]

    @classmethod
    def get_experience_repository(cls) -> IExperienceRepository:
        if "experience" not in cls._instances:
            cls._instances["experience"] = SupabaseExperienceRepository()
        return cls._instances["experience"]

    @classmethod
    def get_certificate_repository(cls) -> ICertificateRepository:
        if "certificate" not in cls._instances:
            cls._instances["certificate"] = SupabaseCertificateRepository()
        return cls._instances["certificate"]

    @classmethod
    def get_system_log_repository(cls) -> ISystemLogRepository:
        if "system_log" not in cls._instances:
            cls._instances["system_log"] = SupabaseSystemLogRepository()
        return cls._instances["system_log"]

    @classmethod
    def get_search_repository(cls) -> ISearchRepository:
        if "search" not in cls._instances:
            cls._instances["search"] = SupabaseSearchRepository()
        return cls._instances["search"]

    @classmethod
    def get_package_repository(cls) -> IPackageRepository:
        if "package" not in cls._instances:
            cls._instances["package"] = SupabasePackageRepository()
        return cls._instances["package"]

    @classmethod
    def get_post_repository(cls) -> IPostRepository:
        if "post" not in cls._instances:
            cls._instances["post"] = SupabasePostRepository()
        return cls._instances["post"]

    @classmethod
    def get_video_repository(cls) -> IVideoRepository:
        if "video" not in cls._instances:
            cls._instances["video"] = SupabaseVideoRepository()
        return cls._instances["video"]
