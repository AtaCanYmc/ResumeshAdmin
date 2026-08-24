import pytest


@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json().get("status") == "ok"
