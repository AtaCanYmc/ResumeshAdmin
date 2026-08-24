import pytest

from app.schemas.article import ArticleCreate
from app.schemas.project import ProjectCreate


@pytest.mark.asyncio
async def test_global_search(client, mock_provider):
    await mock_provider.create_project(
        ProjectCreate(
            title="React Portfolio",
            description="A cool portfolio built with React",
            url="http://test.com",
            languages=["React"],
        )
    )
    await mock_provider.create_article(
        ArticleCreate(
            title="Why I love React",
            summary="React is awesome",
            url="http://medium.com/react",
            platform="MEDIUM",
            published_at="2024-01-01",
        )
    )

    response = await client.get("/api/v1/search/?q=react")
    assert response.status_code == 200
    data = response.json()

    assert data["query"] == "react"
    assert len(data["projects"]) == 1
    assert data["projects"][0]["title"] == "React Portfolio"

    assert len(data["articles"]) == 1
    assert data["articles"][0]["title"] == "Why I love React"

    assert len(data["experiences"]) == 0
    assert len(data["certificates"]) == 0
