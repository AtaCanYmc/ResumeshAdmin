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
async def test_unauthorized_video_endpoints(client):
    response = await client.post("/api/v1/videos/", json={})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_videos_crud_success(client, auth_override):
    # Create Video
    video_data = {
        "title": "demo-video",
        "description": "Demo Video Description",
        "platform": "youtube",
        "url": "https://youtube.com/watch?v=123",
        "thumbnail": "https://youtube.com/watch?v=123/thumb.png",
        "profile": "youtube-profile",
    }
    response = await client.post("/api/v1/videos/", json=video_data)
    assert response.status_code == 200
    created = response.json()
    assert created["title"] == "demo-video"
    assert created["id"] is not None

    # Get Video list
    response = await client.get("/api/v1/videos/")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Get single video
    video_id = created["id"]
    response = await client.get(f"/api/v1/videos/{video_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "demo-video"

    # Put video
    updated_data = video_data.copy()
    updated_data["title"] = "updated-demo-video"
    response = await client.put(f"/api/v1/videos/{video_id}", json=updated_data)
    assert response.status_code == 200
    assert response.json()["title"] == "updated-demo-video"

    # Delete video
    response = await client.delete(f"/api/v1/videos/{video_id}")
    assert response.status_code == 200

    # Get video deleted -> 404
    response = await client.get(f"/api/v1/videos/{video_id}")
    assert response.status_code == 404
