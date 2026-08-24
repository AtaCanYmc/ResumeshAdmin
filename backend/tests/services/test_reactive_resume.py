from datetime import date, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from reactive_resume.models.resume import Basics, ResumeImportData

from app.models.experience import Experience
from app.models.project import Project
from app.services.mappers.reactive_resume_mapper import ReactiveResumeMapper
from app.services.reactive_resume_service import ReactiveResumeService


def test_mapper_format_date_range():
    assert ReactiveResumeMapper.format_date_range(None, None) == ""
    assert (
        ReactiveResumeMapper.format_date_range(date(2020, 1, 1), None, is_current=True)
        == "2020-01 - Present"
    )
    assert (
        ReactiveResumeMapper.format_date_range(date(2020, 1, 1), date(2021, 3, 1))
        == "2020-01 - 2021-03"
    )


def test_mapper_project_mapping():
    proj = Project(
        id="proj-123",
        name="My Awesome Project",
        description="A great test project",
        url="https://github.com/user/project",
        languages=["Python", "HTML"],
        tags=["web", "backend"],
        stars=15,
        forks=3,
        created_at=datetime(2023, 5, 12),
    )
    mapped = ReactiveResumeMapper.map_project(proj)
    assert mapped.id == "proj-123"
    assert mapped.name == "My Awesome Project"
    assert mapped.description == "A great test project"
    assert mapped.url == "https://github.com/user/project"
    assert "Python" in mapped.keywords
    assert "★ 15 | ⑂ 3" in mapped.summary


def test_mapper_experience_mapping():
    exp = Experience(
        id="exp-123",
        company_name="Acme Corp",
        title="Software Engineer",
        location="Remote",
        start_date=date(2021, 1, 1),
        end_date=date(2022, 6, 1),
        is_current=False,
        description="Wrote code.",
    )
    mapped = ReactiveResumeMapper.map_experience(exp)
    assert mapped.id == "exp-123"
    assert mapped.company == "Acme Corp"
    assert mapped.position == "Software Engineer"
    assert mapped.location == "Remote"
    assert mapped.date == "2021-01 - 2022-06"
    assert mapped.summary == "Wrote code."


@pytest.mark.asyncio
async def test_service_pdf_export():
    service = ReactiveResumeService()
    # Mock the nested client resumes attribute
    service.client.resumes = AsyncMock()
    service.client.resumes.get_pdf_url.return_value = (
        "http://localhost:3000/api/openapi/resume/resume-123/pdf"
    )

    pdf_url = await service.export_to_pdf("resume-123")
    assert pdf_url == "http://localhost:3000/api/openapi/resume/resume-123/pdf"
    service.client.resumes.get_pdf_url.assert_called_once_with("resume-123")


@pytest.mark.asyncio
async def test_service_sync_mesh_data():
    service = ReactiveResumeService()
    service.client.resumes = AsyncMock()
    service.client.resumes.update.return_value = MagicMock()

    basics = Basics(name="Ata Can", email="ata@example.com")
    import_data = ResumeImportData(
        title="My Resume",
        basics=basics,
    )

    await service.sync_mesh_data_to_resume("resume-123", import_data)

    # Verify client update was called with correct dictionary format
    args, kwargs = service.client.resumes.update.call_args
    assert args[0] == "resume-123"
    assert args[1]["name"] == "My Resume"
    assert args[1]["data"]["basics"]["name"] == "Ata Can"
