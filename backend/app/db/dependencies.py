from fastapi import Depends
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.db.factory import RepositoryFactory
from app.db.repositories import (
    IArticleRepository,
    ICertificateRepository,
    IEducationRepository,
    IExperienceRepository,
    IPackageRepository,
    IPostRepository,
    IProjectRepository,
    ISearchRepository,
    ISectionRepository,
    ISkillRepository,
    ISocialLinkRepository,
    ISystemLogRepository,
    IVideoRepository,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_project_repo() -> IProjectRepository:
    return RepositoryFactory.get_project_repository()


def get_article_repo() -> IArticleRepository:
    return RepositoryFactory.get_article_repository()


def get_experience_repo() -> IExperienceRepository:
    return RepositoryFactory.get_experience_repository()


def get_certificate_repo() -> ICertificateRepository:
    return RepositoryFactory.get_certificate_repository()


def get_system_log_repo() -> ISystemLogRepository:
    return RepositoryFactory.get_system_log_repository()


def get_search_repo() -> ISearchRepository:
    return RepositoryFactory.get_search_repository()


def get_package_repo(db: Session = Depends(get_db)) -> IPackageRepository:
    # Since packages are read publically but managed by admin,
    # let's load from database via SQLAlchemy
    from app.db.providers.sqlalchemy import SQLAlchemyPackageRepository

    return SQLAlchemyPackageRepository(db)


def get_post_repo(db: Session = Depends(get_db)) -> IPostRepository:
    from app.db.providers.sqlalchemy import SQLAlchemyPostRepository

    return SQLAlchemyPostRepository(db)


def get_video_repo(db: Session = Depends(get_db)) -> IVideoRepository:
    from app.db.providers.sqlalchemy import SQLAlchemyVideoRepository

    return SQLAlchemyVideoRepository(db)


def get_package_supabase_repo() -> IPackageRepository:
    return RepositoryFactory.get_package_repository()


def get_post_supabase_repo() -> IPostRepository:
    return RepositoryFactory.get_post_repository()


def get_video_supabase_repo() -> IVideoRepository:
    return RepositoryFactory.get_video_repository()


def get_education_repo(db: Session = Depends(get_db)) -> IEducationRepository:
    from app.db.providers.sqlalchemy import SQLAlchemyEducationRepository

    return SQLAlchemyEducationRepository(db)


def get_skill_repo(db: Session = Depends(get_db)) -> ISkillRepository:
    from app.db.providers.sqlalchemy import SQLAlchemySkillRepository

    return SQLAlchemySkillRepository(db)


def get_social_link_repo(db: Session = Depends(get_db)) -> ISocialLinkRepository:
    from app.db.providers.sqlalchemy import SQLAlchemySocialLinkRepository

    return SQLAlchemySocialLinkRepository(db)


def get_section_repo(db: Session = Depends(get_db)) -> ISectionRepository:
    from app.db.providers.sqlalchemy import SQLAlchemySectionRepository

    return SQLAlchemySectionRepository(db)
