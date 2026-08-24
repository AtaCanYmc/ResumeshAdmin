"""
Tests for admin permission requirements on POST, PUT, DELETE endpoints
"""

import pytest

from app.main import app
from app.schemas.article import ArticleCreate
from app.schemas.certificate import CertificateCreate
from app.schemas.experience import ExperienceCreate
from app.schemas.project import ProjectCreate
from app.services.auth_service import SupabaseUser, get_current_admin


async def override_get_current_admin():
    """Mock admin user"""
    return SupabaseUser(id="test-admin-uuid", email="admin@example.com", role="admin")


@pytest.fixture
def auth_override():
    """Override authentication to provide admin user"""
    app.dependency_overrides[get_current_admin] = override_get_current_admin
    yield
    app.dependency_overrides.pop(get_current_admin, None)


# ================== EXPERIENCES TESTS ==================


@pytest.mark.asyncio
async def test_create_experience_requires_admin(client):
    """POST /experiences without admin should return 401"""
    response = await client.post(
        "/api/v1/experiences/",
        json={
            "company_name": "Test Company",
            "title": "Developer",
            "start_date": "2025-01-01",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_experience_with_admin(client, mock_provider, auth_override):
    """POST /experiences with admin should succeed"""
    response = await client.post(
        "/api/v1/experiences/",
        json={
            "company_name": "Test Company",
            "title": "Developer",
            "start_date": "2025-01-01",
        },
    )
    assert response.status_code == 200
    assert response.json()["company_name"] == "Test Company"


@pytest.mark.asyncio
async def test_update_experience_requires_admin(client, mock_provider):
    """PUT /experiences/{id} without admin should return 401"""
    # First create an experience
    exp = await mock_provider.exp_repo.create_experience(
        ExperienceCreate(
            company_name="Test Co",
            title="Dev",
            start_date="2025-01-01",
        )
    )

    response = await client.put(
        f"/api/v1/experiences/{exp.id}",
        json={
            "company_name": "Updated Company",
            "title": "Dev",
            "start_date": "2025-01-01",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_experience_with_admin(client, mock_provider, auth_override):
    """PUT /experiences/{id} with admin should succeed"""
    exp = await mock_provider.exp_repo.create_experience(
        ExperienceCreate(
            company_name="Test Co",
            title="Dev",
            start_date="2025-01-01",
        )
    )

    response = await client.put(
        f"/api/v1/experiences/{exp.id}",
        json={
            "company_name": "Updated Company",
            "title": "Dev",
            "start_date": "2025-01-01",
        },
    )
    assert response.status_code == 200
    assert response.json()["company_name"] == "Updated Company"


@pytest.mark.asyncio
async def test_delete_experience_requires_admin(client, mock_provider):
    """DELETE /experiences/{id} without admin should return 401"""
    exp = await mock_provider.exp_repo.create_experience(
        ExperienceCreate(
            company_name="Test Co",
            title="Dev",
            start_date="2025-01-01",
        )
    )

    response = await client.delete(f"/api/v1/experiences/{exp.id}")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_experience_with_admin(client, mock_provider, auth_override):
    """DELETE /experiences/{id} with admin should succeed"""
    exp = await mock_provider.exp_repo.create_experience(
        ExperienceCreate(
            company_name="Test Co",
            title="Dev",
            start_date="2025-01-01",
        )
    )

    response = await client.delete(f"/api/v1/experiences/{exp.id}")
    assert response.status_code == 200


# ================== ARTICLES TESTS ==================


@pytest.mark.asyncio
async def test_create_article_requires_admin(client):
    """POST /articles without admin should return 401"""
    response = await client.post(
        "/api/v1/articles/",
        json={
            "title": "Test Article",
            "url": "https://example.com/article",
            "platform": "MEDIUM",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_article_with_admin(client, mock_provider, auth_override):
    """POST /articles with admin should succeed"""
    response = await client.post(
        "/api/v1/articles/",
        json={
            "title": "Test Article",
            "url": "https://example.com/article",
            "platform": "MEDIUM",
        },
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Test Article"


@pytest.mark.asyncio
async def test_update_article_requires_admin(client, mock_provider):
    """PUT /articles/{id} without admin should return 401"""
    article = await mock_provider.article_repo.create_article(
        ArticleCreate(
            title="Test",
            url="https://example.com/1",
            platform="MEDIUM",
        )
    )

    response = await client.put(
        f"/api/v1/articles/{article.id}",
        json={
            "title": "Updated Title",
            "url": "https://example.com/1",
            "platform": "MEDIUM",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_article_with_admin(client, mock_provider, auth_override):
    """PUT /articles/{id} with admin should succeed"""
    article = await mock_provider.article_repo.create_article(
        ArticleCreate(
            title="Test",
            url="https://example.com/1",
            platform="MEDIUM",
        )
    )

    response = await client.put(
        f"/api/v1/articles/{article.id}",
        json={
            "title": "Updated Title",
            "url": "https://example.com/1",
            "platform": "MEDIUM",
        },
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"


@pytest.mark.asyncio
async def test_delete_article_requires_admin(client, mock_provider):
    """DELETE /articles/{id} without admin should return 401"""
    article = await mock_provider.article_repo.create_article(
        ArticleCreate(
            title="Test",
            url="https://example.com/1",
            platform="MEDIUM",
        )
    )

    response = await client.delete(f"/api/v1/articles/{article.id}")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_article_with_admin(client, mock_provider, auth_override):
    """DELETE /articles/{id} with admin should succeed"""
    article = await mock_provider.article_repo.create_article(
        ArticleCreate(
            title="Test",
            url="https://example.com/1",
            platform="MEDIUM",
        )
    )

    response = await client.delete(f"/api/v1/articles/{article.id}")
    assert response.status_code == 200


# ================== CERTIFICATES TESTS ==================


@pytest.mark.asyncio
async def test_create_certificate_requires_admin(client):
    """POST /certificates without admin should return 401"""
    response = await client.post(
        "/api/v1/certificates/",
        json={
            "name": "Test Certificate",
            "issuing_organization": "Test Issuer",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_certificate_with_admin(client, mock_provider, auth_override):
    """POST /certificates with admin should succeed"""
    response = await client.post(
        "/api/v1/certificates/",
        json={
            "name": "Test Certificate",
            "issuing_organization": "Test Issuer",
        },
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Certificate"


@pytest.mark.asyncio
async def test_update_certificate_requires_admin(client, mock_provider):
    """PUT /certificates/{id} without admin should return 401"""
    cert = await mock_provider.cert_repo.create_certificate(
        CertificateCreate(
            name="Test Cert",
            issuing_organization="Issuer",
        )
    )

    response = await client.put(
        f"/api/v1/certificates/{cert.id}",
        json={"name": "Updated Name", "issuing_organization": "Issuer"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_certificate_with_admin(client, mock_provider, auth_override):
    """PUT /certificates/{id} with admin should succeed"""
    cert = await mock_provider.cert_repo.create_certificate(
        CertificateCreate(
            name="Test Cert",
            issuing_organization="Issuer",
        )
    )

    response = await client.put(
        f"/api/v1/certificates/{cert.id}",
        json={"name": "Updated Name", "issuing_organization": "Issuer"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_delete_certificate_requires_admin(client, mock_provider):
    """DELETE /certificates/{id} without admin should return 401"""
    cert = await mock_provider.cert_repo.create_certificate(
        CertificateCreate(
            name="Test Cert",
            issuing_organization="Issuer",
        )
    )

    response = await client.delete(f"/api/v1/certificates/{cert.id}")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_certificate_with_admin(client, mock_provider, auth_override):
    """DELETE /certificates/{id} with admin should succeed"""
    cert = await mock_provider.cert_repo.create_certificate(
        CertificateCreate(
            name="Test Cert",
            issuing_organization="Issuer",
        )
    )

    response = await client.delete(f"/api/v1/certificates/{cert.id}")
    assert response.status_code == 200


# ================== PROJECTS TESTS ==================


@pytest.mark.asyncio
async def test_create_project_requires_admin(client):
    """POST /projects without admin should return 401"""
    response = await client.post(
        "/api/v1/projects/",
        json={
            "title": "Test Project",
            "url": "https://github.com/test/repo",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_project_with_admin(client, mock_provider, auth_override):
    """POST /projects with admin should succeed"""
    response = await client.post(
        "/api/v1/projects/",
        json={
            "title": "Test Project",
            "url": "https://github.com/test/repo",
        },
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Test Project"


@pytest.mark.asyncio
async def test_update_project_requires_admin(client, mock_provider):
    """PUT /projects/{id} without admin should return 401"""
    project = await mock_provider.project_repo.create_project(
        ProjectCreate(
            title="Test",
            url="https://github.com/test/1",
        )
    )

    response = await client.put(
        f"/api/v1/projects/{project.id}",
        json={"title": "Updated Title"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_project_with_admin(client, mock_provider, auth_override):
    """PUT /projects/{id} with admin should succeed"""
    project = await mock_provider.project_repo.create_project(
        ProjectCreate(
            title="Test",
            url="https://github.com/test/1",
        )
    )

    response = await client.put(
        f"/api/v1/projects/{project.id}",
        json={"title": "Updated Title"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"


@pytest.mark.asyncio
async def test_delete_project_requires_admin(client, mock_provider):
    """DELETE /projects/{id} without admin should return 401"""
    project = await mock_provider.project_repo.create_project(
        ProjectCreate(
            title="Test",
            url="https://github.com/test/1",
        )
    )

    response = await client.delete(f"/api/v1/projects/{project.id}")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_project_with_admin(client, mock_provider, auth_override):
    """DELETE /projects/{id} with admin should succeed"""
    project = await mock_provider.project_repo.create_project(
        ProjectCreate(
            title="Test",
            url="https://github.com/test/1",
        )
    )

    response = await client.delete(f"/api/v1/projects/{project.id}")
    assert response.status_code == 200
