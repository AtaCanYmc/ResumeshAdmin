import pytest

from app.config.settings import settings
from app.main import app
from app.services.auth_service import SupabaseUser, get_current_admin
from app.services.supabase_storage import SupabaseStorageService


async def override_get_current_admin():
    return SupabaseUser(id="test-admin-uuid", email="admin@example.com", role="admin")


@pytest.fixture
def auth_override():
    app.dependency_overrides[get_current_admin] = override_get_current_admin
    yield
    app.dependency_overrides.pop(get_current_admin, None)


@pytest.fixture(autouse=True)
def mock_supabase_env(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_URL", "https://mock.supabase.co")
    monkeypatch.setattr(settings, "SUPABASE_KEY", "mock_key")


@pytest.mark.asyncio
async def test_unauthorized_upload(client):
    response = await client.post(
        "/api/v1/cv/upload",
        files={"file": ("test.pdf", b"pdf content", "application/pdf")},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_upload_invalid_file_type(client, auth_override):
    response = await client.post(
        "/api/v1/cv/upload", files={"file": ("test.txt", b"txt content", "text/plain")}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Only PDF files are allowed"


@pytest.mark.asyncio
async def test_upload_cv_success(client, monkeypatch, auth_override):
    async def mock_upload(self, filename, file_bytes):
        return "test.pdf"

    def mock_get_public_url(self, filename):
        return "https://supabase.com/storage/v1/object/public/cv-pdfs/test.pdf"

    monkeypatch.setattr(SupabaseStorageService, "upload_cv", mock_upload)
    monkeypatch.setattr(SupabaseStorageService, "get_public_url", mock_get_public_url)

    response = await client.post(
        "/api/v1/cv/upload",
        files={"file": ("test.pdf", b"pdf content", "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["filename"] == "test.pdf"
    assert "public/cv-pdfs/test.pdf" in data["url"]


@pytest.mark.asyncio
async def test_list_cvs_success(client, monkeypatch, auth_override):
    async def mock_list(self):
        return [{"name": "cv1.pdf", "id": "1"}, {"name": "cv2.pdf", "id": "2"}]

    monkeypatch.setattr(SupabaseStorageService, "list_cvs", mock_list)

    response = await client.get("/api/v1/cv/list")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["files"]) == 2
    assert data["files"][0]["name"] == "cv1.pdf"


@pytest.mark.asyncio
async def test_download_cv_success(client, monkeypatch):
    async def mock_download(self, filename):
        return b"pdf binary content mock"

    monkeypatch.setattr(SupabaseStorageService, "download_cv", mock_download)

    response = await client.get("/api/v1/cv/test.pdf")
    assert response.status_code == 200
    assert response.content == b"pdf binary content mock"
    assert response.headers["content-type"] == "application/pdf"
    assert "inline; filename=test.pdf" in response.headers["content-disposition"]
