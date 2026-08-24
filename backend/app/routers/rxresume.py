from fastapi import APIRouter, Depends, HTTPException
from reactive_resume.models import Basics

from app.db.dependencies import (
    get_article_repo,
    get_certificate_repo,
    get_education_repo,
    get_experience_repo,
    get_project_repo,
    get_skill_repo,
    get_system_log_repo,
)
from app.db.repositories import (
    IArticleRepository,
    ICertificateRepository,
    IEducationRepository,
    IExperienceRepository,
    IProjectRepository,
    ISkillRepository,
    ISystemLogRepository,
)
from app.services.auth_service import get_current_admin
from app.services.mappers.reactive_resume_mapper import ReactiveResumeMapper
from app.services.reactive_resume_service import ReactiveResumeService

router = APIRouter(prefix="/admin/rxresume", tags=["Admin Reactive Resume Management"])


@router.get("/resumes")
async def get_rxresume_resumes(
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        service = ReactiveResumeService(log_provider=log_repo)
        resumes = await service.list_resumes()
        return {
            "status": "success",
            "resumes": [
                r.model_dump(by_alias=True, exclude_none=True) for r in resumes
            ],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch resumes: {str(e)}"
        )


@router.get("/resume/{resume_id}/pdf")
async def get_rxresume_pdf(
    resume_id: str,
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        service = ReactiveResumeService(log_provider=log_repo)
        pdf_url = await service.export_to_pdf(resume_id)
        return {"status": "success", "url": pdf_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get PDF URL: {str(e)}")


@router.post("/resume/{resume_id}/sync")
async def sync_rxresume(
    resume_id: str,
    project_repo: IProjectRepository = Depends(get_project_repo),
    experience_repo: IExperienceRepository = Depends(get_experience_repo),
    certificate_repo: ICertificateRepository = Depends(get_certificate_repo),
    article_repo: IArticleRepository = Depends(get_article_repo),
    education_repo: IEducationRepository = Depends(get_education_repo),
    skill_repo: ISkillRepository = Depends(get_skill_repo),
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        # Fetch all database records using repositories
        skills = await skill_repo.get_skills(limit=1000)
        educations = await education_repo.get_educations(limit=1000)

        db_projects = await project_repo.get_projects(limit=1000)
        db_experiences = await experience_repo.get_all_experiences(limit=1000)
        db_certificates = await certificate_repo.get_all_certificates(limit=1000)
        db_articles = await article_repo.get_all_articles(limit=1000)

        # Build Basics
        basics = Basics(
            name="Ata Can Yaymacı",
            headline="Software Engineer",
            email="ata@example.com",
            phone="",
            website="",
            location="",
            profiles=[],
        )

        # Create Import Data using Mapper
        import_data = ReactiveResumeMapper.build_resume_import_data(
            title="ResuMesh Synced CV",
            basics=basics,
            projects=db_projects,
            experiences=db_experiences,
            educations=educations,
            certificates=db_certificates,
            articles=db_articles,
            skills=skills,
        )

        # Sync using Service
        service = ReactiveResumeService(log_provider=log_repo)
        await service.sync_mesh_data_to_resume(resume_id, import_data)

        return {
            "status": "success",
            "message": "Resume data successfully synchronized with ResuMesh.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.get("/applications")
async def get_rxresume_applications(
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        service = ReactiveResumeService(log_provider=log_repo)
        apps = await service.client.applications.list()
        return {
            "status": "success",
            "applications": [
                a.model_dump(by_alias=True, exclude_none=True) for a in apps
            ],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch job applications: {str(e)}"
        )


@router.get("/agent/threads")
async def get_rxresume_agent_threads(
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        service = ReactiveResumeService(log_provider=log_repo)
        threads = await service.client.agent.list_threads()
        return {"status": "success", "threads": threads}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch agent threads: {str(e)}"
        )


@router.get("/ai-providers")
async def get_rxresume_ai_providers(
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        service = ReactiveResumeService(log_provider=log_repo)
        providers = await service.client.ai_providers.list()
        return {"status": "success", "providers": providers}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch AI providers: {str(e)}"
        )


@router.get("/statistics")
async def get_rxresume_statistics(
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        service = ReactiveResumeService(log_provider=log_repo)
        resumes_count = await service.client.statistics.get_resumes_count()
        users_count = await service.client.statistics.get_users_count()
        github_stars = await service.client.statistics.get_github_stars()

        # Robust parsing for numbers or dict structures
        r_val = (
            resumes_count.get("count", 0)
            if isinstance(resumes_count, dict)
            else resumes_count
        )
        u_val = (
            users_count.get("count", 0)
            if isinstance(users_count, dict)
            else users_count
        )
        g_val = (
            github_stars.get("stars", github_stars.get("count", 0))
            if isinstance(github_stars, dict)
            else github_stars
        )

        return {
            "status": "success",
            "statistics": {
                "resumesCount": r_val,
                "usersCount": u_val,
                "githubStars": g_val,
            },
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch statistics: {str(e)}"
        )


@router.get("/resume/{resume_id}/versions")
async def get_rxresume_versions(
    resume_id: str,
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        service = ReactiveResumeService(log_provider=log_repo)
        versions = await service.client.resumes.get_versions(resume_id)
        return {"status": "success", "versions": versions}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch resume versions: {str(e)}"
        )


@router.post("/resume/{resume_id}/analyze")
async def analyze_rxresume(
    resume_id: str,
    provider_id: str = None,
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        service = ReactiveResumeService(log_provider=log_repo)
        if not provider_id:
            providers = await service.client.ai_providers.list()
            if providers and len(providers) > 0:
                provider_id = providers[0].get("id")
            else:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No AI Providers found on Reactive Resume. "
                        "Please configure an AI Provider first."
                    ),
                )

        analysis = await service.client.ai.analyze_resume(resume_id, provider_id)
        return {"status": "success", "analysis": analysis}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")


@router.get("/resume/{resume_id}/analysis")
async def get_rxresume_analysis(
    resume_id: str,
    admin=Depends(get_current_admin),
    log_repo: ISystemLogRepository = Depends(get_system_log_repo),
):
    try:
        service = ReactiveResumeService(log_provider=log_repo)
        analysis = await service.client.resumes.get_latest_analysis(resume_id)
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch latest resume analysis: {str(e)}"
        )
