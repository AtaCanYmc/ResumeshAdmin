import pytest

from app.main import app
from app.schemas.system_log import SystemLogCreate
from app.services.auth_service import SupabaseUser, get_current_admin


async def override_get_current_admin():
    return SupabaseUser(id="test-admin-uuid", email="admin@example.com", role="admin")


@pytest.fixture
def auth_override():
    app.dependency_overrides[get_current_admin] = override_get_current_admin
    yield
    app.dependency_overrides.pop(get_current_admin, None)


@pytest.mark.asyncio
async def test_unauthorized_access_to_logs(client):
    # Without auth override, this should fail with 401
    response = await client.get("/api/v1/admin/logs")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_system_logs(client, mock_provider, auth_override):
    # Seed some logs
    await mock_provider.create_log(
        SystemLogCreate(level="INFO", module="TEST", message="Msg 1")
    )
    await mock_provider.create_log(
        SystemLogCreate(level="ERROR", module="TEST", message="Msg 2")
    )

    response = await client.get("/api/v1/admin/logs")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["data"]) == 2


@pytest.mark.asyncio
async def test_get_system_logs_filtered(client, mock_provider, auth_override):
    await mock_provider.create_log(
        SystemLogCreate(level="INFO", module="TEST", message="Msg 1")
    )
    await mock_provider.create_log(
        SystemLogCreate(level="ERROR", module="TEST", message="Msg 2")
    )

    response = await client.get("/api/v1/admin/logs?level=ERROR")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["data"][0]["level"] == "ERROR"


@pytest.mark.asyncio
async def test_generate_cv(client, monkeypatch, auth_override):
    # Mock ScraperService to avoid network call
    async def mock_scrape(url):
        return "We are looking for a Python developer with FastAPI experience."

    from app.services.scraper_service import ScraperService

    monkeypatch.setattr(ScraperService, "scrape_job_description", mock_scrape)

    # Force LLM Provider to be mock and reset cache
    import app.llm.factory as llm_factory
    from app.config.settings import settings

    monkeypatch.setattr(llm_factory, "_client_instance", None)
    monkeypatch.setattr(settings, "LLM_PROVIDER", "mock")

    response = await client.post(
        "/api/v1/admin/generate-cv", json={"job_url": "https://example.com/job"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["cv_data"]["title"] == "Mocked CV"


@pytest.mark.asyncio
async def test_get_rxresume_resumes(client, monkeypatch, auth_override):
    from datetime import datetime

    from reactive_resume.models.resume import Basics, Resume, ResumeData

    from app.services.reactive_resume_service import ReactiveResumeService

    mock_resume = Resume(
        id="resume-1",
        name="Test CV",
        slug="test-cv",
        userId="user-123",
        visibility="public",
        locked=False,
        data=ResumeData(basics=Basics(name="Ata")),
        createdAt=datetime.now(),
        updatedAt=datetime.now(),
    )

    async def mock_list_resumes(self):
        return [mock_resume]

    monkeypatch.setattr(ReactiveResumeService, "list_resumes", mock_list_resumes)

    response = await client.get("/api/v1/admin/rxresume/resumes")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["resumes"]) == 1
    assert data["resumes"][0]["name"] == "Test CV"


@pytest.mark.asyncio
async def test_get_rxresume_pdf(client, monkeypatch, auth_override):
    from app.services.reactive_resume_service import ReactiveResumeService

    async def mock_export_to_pdf(self, resume_id):
        return f"http://mocked-pdf-url/{resume_id}"

    monkeypatch.setattr(ReactiveResumeService, "export_to_pdf", mock_export_to_pdf)

    response = await client.get("/api/v1/admin/rxresume/resume/resume-1/pdf")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["url"] == "http://mocked-pdf-url/resume-1"


@pytest.mark.asyncio
async def test_sync_rxresume(client, monkeypatch, auth_override):
    from app.services.reactive_resume_service import ReactiveResumeService

    async def mock_sync(self, resume_id, import_data):
        return None

    monkeypatch.setattr(ReactiveResumeService, "sync_mesh_data_to_resume", mock_sync)

    response = await client.post("/api/v1/admin/rxresume/resume/resume-1/sync")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "synchronized" in data["message"]


@pytest.mark.asyncio
async def test_get_rxresume_applications(client, monkeypatch, auth_override):
    from datetime import datetime

    from reactive_resume.models.application import Application

    from app.services.reactive_resume_service import ReactiveResumeService

    mock_app = Application(
        id="app-1",
        userId="user-123",
        company="Acme Corp",
        position="Developer",
        stage="Applied",
        date=datetime.now(),
        createdAt=datetime.now(),
        updatedAt=datetime.now(),
    )

    # Mock the client.applications.list method
    async def mock_list():
        return [mock_app]

    # Initialize a dummy client to patch
    service = ReactiveResumeService()
    monkeypatch.setattr(service.client.applications, "list", mock_list)

    # Patch service to return mocked instance
    monkeypatch.setattr(
        "app.routers.rxresume.ReactiveResumeService", lambda *args, **kwargs: service
    )

    response = await client.get("/api/v1/admin/rxresume/applications")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["applications"]) == 1
    assert data["applications"][0]["company"] == "Acme Corp"


@pytest.mark.asyncio
async def test_get_rxresume_agent_threads(client, monkeypatch, auth_override):
    from app.services.reactive_resume_service import ReactiveResumeService

    async def mock_threads():
        return [{"id": "thread-1", "title": "Chat with AI"}]

    service = ReactiveResumeService()
    monkeypatch.setattr(service.client.agent, "list_threads", mock_threads)
    monkeypatch.setattr(
        "app.routers.rxresume.ReactiveResumeService", lambda *args, **kwargs: service
    )

    response = await client.get("/api/v1/admin/rxresume/agent/threads")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["threads"]) == 1
    assert data["threads"][0]["id"] == "thread-1"


@pytest.mark.asyncio
async def test_get_rxresume_ai_providers(client, monkeypatch, auth_override):
    from app.services.reactive_resume_service import ReactiveResumeService

    async def mock_providers():
        return [{"id": "provider-1", "label": "OpenAI GPT-4"}]

    service = ReactiveResumeService()
    monkeypatch.setattr(service.client.ai_providers, "list", mock_providers)
    monkeypatch.setattr(
        "app.routers.rxresume.ReactiveResumeService", lambda *args, **kwargs: service
    )

    response = await client.get("/api/v1/admin/rxresume/ai-providers")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["providers"]) == 1
    assert data["providers"][0]["label"] == "OpenAI GPT-4"


@pytest.mark.asyncio
async def test_get_rxresume_statistics(client, monkeypatch, auth_override):
    from app.services.reactive_resume_service import ReactiveResumeService

    async def mock_resumes_count():
        return {"count": 12}

    async def mock_users_count():
        return {"count": 5}

    async def mock_github_stars():
        return {"stars": 999}

    service = ReactiveResumeService()
    monkeypatch.setattr(
        service.client.statistics, "get_resumes_count", mock_resumes_count
    )
    monkeypatch.setattr(service.client.statistics, "get_users_count", mock_users_count)
    monkeypatch.setattr(
        service.client.statistics, "get_github_stars", mock_github_stars
    )
    monkeypatch.setattr(
        "app.routers.rxresume.ReactiveResumeService", lambda *args, **kwargs: service
    )

    response = await client.get("/api/v1/admin/rxresume/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["statistics"]["resumesCount"] == 12
    assert data["statistics"]["usersCount"] == 5
    assert data["statistics"]["githubStars"] == 999


@pytest.mark.asyncio
async def test_get_rxresume_versions(client, monkeypatch, auth_override):
    from app.services.reactive_resume_service import ReactiveResumeService

    async def mock_versions(resume_id):
        return [{"id": "v-1", "name": "Initial Revision"}]

    service = ReactiveResumeService()
    monkeypatch.setattr(service.client.resumes, "get_versions", mock_versions)
    monkeypatch.setattr(
        "app.routers.rxresume.ReactiveResumeService", lambda *args, **kwargs: service
    )

    response = await client.get("/api/v1/admin/rxresume/resume/resume-1/versions")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["versions"]) == 1
    assert data["versions"][0]["id"] == "v-1"


@pytest.mark.asyncio
async def test_analyze_rxresume(client, monkeypatch, auth_override):
    from app.services.reactive_resume_service import ReactiveResumeService

    async def mock_providers():
        return [{"id": "provider-1"}]

    async def mock_analyze(resume_id, provider_id):
        return {"score": 85, "feedback": "Great resume"}

    service = ReactiveResumeService()
    monkeypatch.setattr(service.client.ai_providers, "list", mock_providers)
    monkeypatch.setattr(service.client.ai, "analyze_resume", mock_analyze)
    monkeypatch.setattr(
        "app.routers.rxresume.ReactiveResumeService", lambda *args, **kwargs: service
    )

    response = await client.post("/api/v1/admin/rxresume/resume/resume-1/analyze")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["analysis"]["score"] == 85


@pytest.mark.asyncio
async def test_get_rxresume_analysis(client, monkeypatch, auth_override):
    from app.services.reactive_resume_service import ReactiveResumeService

    async def mock_analysis(resume_id):
        return {"grammar": 90, "score": 85, "feedback": "Great resume"}

    service = ReactiveResumeService()
    monkeypatch.setattr(service.client.resumes, "get_latest_analysis", mock_analysis)
    monkeypatch.setattr(
        "app.routers.rxresume.ReactiveResumeService", lambda *args, **kwargs: service
    )

    response = await client.get("/api/v1/admin/rxresume/resume/resume-1/analysis")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["analysis"]["grammar"] == 90
