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
async def test_unauthorized_social_link_endpoints(client):
    response = await client.post("/api/v1/social-links/", json={})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_social_links_crud_success(client, auth_override):
    # Create Social Link
    link_data = {
        "platform": "github",
        "label": "GitHub Profile",
        "url": "https://github.com/AtaCanYmc",
        "icon": "github",
        "order_index": 1,
        "is_active": True,
    }
    response = await client.post("/api/v1/social-links/", json=link_data)
    assert response.status_code == 200
    created = response.json()
    assert created["platform"] == "github"
    assert created["label"] == "GitHub Profile"
    assert created["id"] is not None

    # Get Social Links list
    response = await client.get("/api/v1/social-links/")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Get single social link
    link_id = created["id"]
    response = await client.get(f"/api/v1/social-links/{link_id}")
    assert response.status_code == 200
    assert response.json()["label"] == "GitHub Profile"

    # Put social link
    updated_data = link_data.copy()
    updated_data["label"] = "Updated GitHub Profile"
    response = await client.put(f"/api/v1/social-links/{link_id}", json=updated_data)
    assert response.status_code == 200
    assert response.json()["label"] == "Updated GitHub Profile"

    # Delete social link
    response = await client.delete(f"/api/v1/social-links/{link_id}")
    assert response.status_code == 200

    # Get social link deleted -> 404
    response = await client.get(f"/api/v1/social-links/{link_id}")
    assert response.status_code == 404
