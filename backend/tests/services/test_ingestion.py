import pytest
import respx
from httpx import Response
from resumesh_scrapers import (
    BehanceScraper,
    GitHubScraperService,
    NpmScraperService,
    PyPIScraperService,
    SubstackScraperService,
)

from app.services.ingestion_service import IngestionService


@pytest.mark.asyncio
@respx.mock
async def test_fetch_github_repos_success(mock_provider):
    mock_response = [
        {
            "name": "ResuMesh",
            "description": "Smart Portfolio",
            "html_url": "https://github.com/user/resumesh",
            "stargazers_count": 10,
            "watchers_count": 10,
            "forks_count": 2,
            "language": "Python",
            "fork": False,
        }
    ]

    respx.get("https://api.github.com/users/test-user/repos").mock(
        return_value=Response(200, json=mock_response)
    )

    scraper = GitHubScraperService()
    service = IngestionService()
    await service.fetch_github_repos(scraper, "test-user", mock_provider)

    projects = await mock_provider.get_projects()
    assert len(projects) == 1
    assert projects[0].title == "ResuMesh"
    assert projects[0].stars == 10
    assert "Python" in projects[0].languages


@pytest.mark.asyncio
@respx.mock
async def test_fetch_pypi_packages_success(mock_provider):
    mock_response = {
        "info": {
            "name": "test-package",
            "summary": "A test package summary",
            "description": "Full description",
            "package_url": "https://pypi.org/project/test-package",
            "docs_url": "https://docs.pypi.org/test-package",
            "keywords": "test,package",
            "version": "1.0.0",
            "downloads": {
                "last_day": 5,
                "last_week": 35,
                "last_month": 150,
            },
        },
        "last_serial": 12345,
        "ownership": {
            "organization": None,
            "roles": [{"role": "owner", "user": "test-user"}],
        },
        "releases": {},
        "urls": [],
    }

    respx.get("https://pypi.org/pypi/test-package/json").mock(
        return_value=Response(200, json=mock_response)
    )

    scraper = PyPIScraperService()
    service = IngestionService()
    await service.fetch_pypi_packages(
        scraper, "test-user", mock_provider, ["test-package"]
    )

    packages = await mock_provider.get_packages()
    assert len(packages) == 1
    assert packages[0].title == "test-package"
    assert packages[0].platform == "pypi"
    assert packages[0].last_month_downloads == 150


@pytest.mark.asyncio
@respx.mock
async def test_fetch_npm_packages_success(mock_provider):
    mock_response = {
        "objects": [
            {
                "package": {
                    "name": "test-npm-pkg",
                    "version": "2.1.0",
                    "description": "NPM package description",
                    "keywords": ["node", "npm"],
                    "links": {
                        "npm": "https://www.npmjs.com/package/test-npm-pkg",
                        "homepage": "https://test-npm-pkg.js.org",
                    },
                },
                "downloads": {"monthly": 500, "weekly": 120},
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

    scraper = NpmScraperService()
    service = IngestionService()
    await service.fetch_npm_packages(scraper, "test-user", mock_provider)

    packages = await mock_provider.get_packages()
    assert len(packages) == 1
    assert packages[0].title == "test-npm-pkg"
    assert packages[0].platform == "npm"
    assert packages[0].last_month_downloads == 500


@pytest.mark.asyncio
@respx.mock
async def test_fetch_substack_articles_success(mock_provider):
    xml_content = """<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Test Substack</title>
        <link>https://test.substack.com</link>
        <description>Test Substack description</description>
        <item>
          <title>Test Post Title</title>
          <link>https://test.substack.com/p/test-post</link>
          <description>Post summary details</description>
          <pubDate>Fri, 24 Jul 2026 12:00:00 GMT</pubDate>
        </item>
      </channel>
    </rss>
    """

    respx.get("https://test.substack.com/feed").mock(
        return_value=Response(200, text=xml_content)
    )

    scraper = SubstackScraperService()
    service = IngestionService()
    await service.fetch_substack_articles(scraper, "test", mock_provider)

    articles = await mock_provider.get_all_articles()
    assert len(articles) == 1
    assert articles[0].title == "Test Post Title"
    assert articles[0].platform == "SUBSTACK"
    assert str(articles[0].url) == "https://test.substack.com/p/test-post"


@pytest.mark.asyncio
@respx.mock
async def test_fetch_behance_projects_success(mock_provider):
    # Mocking Behance scraping (non-API flow)
    html_content = """
    <html>
      <body>
        <div class="content-grid">
          <div class="project-card" data-id="12345">
            <a class="project-title"
               href="https://www.behance.net/gallery/12345/My-UI-Design">
               My UI Design
            </a>
            <span class="project-appreciations">50</span>
            <span class="project-views">2500</span>
            <img class="project-cover-image"
                 src="https://mir-s3-cdn-cf.behance.net/cover.jpg"/>
          </div>
        </div>
      </body>
    </html>
    """

    respx.get("https://www.behance.net/test-user").mock(
        return_value=Response(200, text=html_content)
    )

    scraper = BehanceScraper()
    service = IngestionService()
    await service.fetch_behance_projects(scraper, "test-user", mock_provider)

    projects = await mock_provider.get_projects()
    assert len(projects) == 1
    assert projects[0].title == "My UI Design"
    assert projects[0].stars == 50
    assert projects[0].watchers == 0
