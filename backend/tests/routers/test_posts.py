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
async def test_unauthorized_post_endpoints(client):
    response = await client.post("/api/v1/posts/", json={})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_posts_crud_success(client, auth_override):
    # Create Post
    post_data = {
        "title": "demo-post",
        "description": "Demo Post Description",
        "platform": "medium",
        "url": "https://medium.com/@user/demo-post",
        "thumbnail": "https://medium.com/@user/demo-post/thumb.png",
        "profile": "medium-profile",
    }
    response = await client.post("/api/v1/posts/", json=post_data)
    assert response.status_code == 200
    created = response.json()
    assert created["title"] == "demo-post"
    assert created["id"] is not None

    # Get Post list
    response = await client.get("/api/v1/posts/")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Get single post
    post_id = created["id"]
    response = await client.get(f"/api/v1/posts/{post_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "demo-post"

    # Put post
    updated_data = post_data.copy()
    updated_data["title"] = "updated-demo-post"
    response = await client.put(f"/api/v1/posts/{post_id}", json=updated_data)
    assert response.status_code == 200
    assert response.json()["title"] == "updated-demo-post"

    # Delete post
    response = await client.delete(f"/api/v1/posts/{post_id}")
    assert response.status_code == 200

    # Get post deleted -> 404
    response = await client.get(f"/api/v1/posts/{post_id}")
    assert response.status_code == 404
