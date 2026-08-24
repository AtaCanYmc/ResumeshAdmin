import pytest


@pytest.mark.asyncio
async def test_docs_endpoint_is_served_under_api_v1(client):
    response = await client.get("/api/v1/docs")

    assert response.status_code == 200
    assert "Swagger UI" in response.text
    assert "/api/v1/openapi.json" in response.text


@pytest.mark.asyncio
async def test_openapi_endpoint_is_served_under_api_v1(client):
    response = await client.get("/api/v1/openapi.json")

    assert response.status_code == 200
    payload = response.json()
    assert payload["info"]["title"] == "ResuMesh API"
    assert payload["openapi"].startswith("3.")


@pytest.mark.asyncio
async def test_old_default_docs_path_is_not_available(client):
    response = await client.get("/docs")

    assert response.status_code == 404
