import pytest
import respx
from httpx import Response

from app.main import app
from app.services.auth_service import SupabaseUser, get_current_admin


async def override_get_current_admin():
    return SupabaseUser(id="test-admin-uuid", email="admin@example.com", role="admin")


@pytest.fixture
def auth_override():
    app.dependency_overrides[get_current_admin] = override_get_current_admin
    yield
    app.dependency_overrides.pop(get_current_admin, None)


@pytest.mark.asyncio
async def test_unauthorized_package_endpoints(client):
    # Create
    response = await client.post("/api/v1/packages/", json={})
    assert response.status_code == 401

    # Refresh
    response = await client.post("/api/v1/packages/refresh", json={})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_packages_crud_success(client, auth_override):
    # Create Package
    pkg_data = {
        "title": "demo-pkg",
        "description": "Demo Package Description",
        "platform": "npm",
        "url": "https://www.npmjs.com/package/demo-pkg",
        "docs_url": "https://demo-pkg.js.org",
        "tags": "demo,pkg",
        "version": "1.0.0",
        "last_month_downloads": 100,
    }
    response = await client.post("/api/v1/packages/", json=pkg_data)
    assert response.status_code == 200
    created = response.json()
    assert created["title"] == "demo-pkg"
    assert created["id"] is not None

    # Get Package list
    response = await client.get("/api/v1/packages/")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Get single package
    pkg_id = created["id"]
    response = await client.get(f"/api/v1/packages/{pkg_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "demo-pkg"

    # Put package
    updated_data = pkg_data.copy()
    updated_data["version"] = "2.0.0"
    response = await client.put(f"/api/v1/packages/{pkg_id}", json=updated_data)
    assert response.status_code == 200
    assert response.json()["version"] == "2.0.0"

    # Delete package
    response = await client.delete(f"/api/v1/packages/{pkg_id}")
    assert response.status_code == 200

    # Get package deleted -> 404
    response = await client.get(f"/api/v1/packages/{pkg_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
@respx.mock
async def test_refresh_packages_success(client, auth_override):
    mock_response = {
        "objects": [
            {
                "package": {
                    "name": "scraped-npm-pkg",
                    "version": "1.0.0",
                    "description": "NPM package description",
                    "keywords": ["node"],
                    "links": {
                        "npm": "https://www.npmjs.com/package/scraped-npm-pkg",
                        "homepage": "https://scraped-npm-pkg.js.org",
                    },
                },
                "downloads": {"monthly": 200, "weekly": 50},
            }
        ],
        "total": 1,
        "time": "2026-07-24",
    }
    npm_url = (
        "https://registry.npmjs.org/-/v1/"
        "search?text=maintainer:test-user&size=100&from=0"
    )
    respx.get(npm_url).mock(return_value=Response(200, json=mock_response))

    response = await client.post(
        "/api/v1/packages/refresh",
        json={"platform": "npm", "username": "test-user"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "processing"
