import pytest

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
async def test_unauthorized_section_endpoints(client):
    response = await client.post("/api/v1/sections/", json={})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_sections_crud_success(client, auth_override):
    # Create Section
    section_data = {
        "key": "projects",
        "title": "Projects Section",
        "description": "Show or hide your projects page on the public site.",
        "is_active": True,
        "order_index": 1,
    }
    response = await client.post("/api/v1/sections/", json=section_data)
    assert response.status_code == 200
    created = response.json()
    assert created["key"] == "projects"
    assert created["title"] == "Projects Section"
    assert created["id"] is not None

    # Get Section list
    response = await client.get("/api/v1/sections/")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Get single section by key
    response = await client.get("/api/v1/sections/projects")
    assert response.status_code == 200
    assert response.json()["title"] == "Projects Section"

    # Put update section
    updated_data = section_data.copy()
    updated_data["title"] = "Updated Projects Section"
    response = await client.put("/api/v1/sections/projects", json=updated_data)
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Projects Section"

    # Patch toggle active
    response = await client.patch("/api/v1/sections/projects/toggle")
    assert response.status_code == 200
    assert response.json()["is_active"] is False

    # Delete section
    response = await client.delete("/api/v1/sections/projects")
    assert response.status_code == 200

    # Get deleted section -> 404
    response = await client.get("/api/v1/sections/projects")
    assert response.status_code == 404
