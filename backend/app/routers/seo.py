from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, Response

from app.config.settings import settings
from app.db.dependencies import get_project_repo
from app.db.repositories import IProjectRepository
from app.schemas.project import ProjectResponse

router = APIRouter(tags=["seo"])

FRONTEND_URL = settings.FRONTEND_URL.rstrip("/")


@router.get("/sitemap.xml", response_class=Response)
async def get_sitemap(
    project_repo: IProjectRepository = Depends(get_project_repo),
):
    # Static routes
    static_urls = [
        "",
        "/projects",
    ]

    # Dynamic routes
    projects: List[ProjectResponse] = await project_repo.get_projects(limit=1000)

    # Generate XML
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    # Add static routes
    for route in static_urls:
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{FRONTEND_URL}{route}</loc>")
        xml_lines.append("    <changefreq>weekly</changefreq>")
        xml_lines.append("    <priority>1.0</priority>")
        xml_lines.append("  </url>")

    # Add projects
    for project in projects:
        xml_lines.append("  <url>")
        # Assuming frontend has /projects/:id
        xml_lines.append(f"    <loc>{FRONTEND_URL}/projects/{project.id}</loc>")
        lastmod = (
            project.updated_at.strftime("%Y-%m-%d")
            if project.updated_at
            else datetime.now().strftime("%Y-%m-%d")
        )
        xml_lines.append(f"    <lastmod>{lastmod}</lastmod>")
        xml_lines.append("    <changefreq>monthly</changefreq>")
        xml_lines.append("    <priority>0.8</priority>")
        xml_lines.append("  </url>")

    # Add articles if there is a frontend route for them
    # Since there might not be a standalone article page on the frontend
    # (they might link to Medium), let's only add them if we are sure there is a route.
    # The user only mentioned projects in the plan.
    # We will omit articles for now to avoid broken 404 links in sitemap.

    xml_lines.append("</urlset>")

    xml_content = "\n".join(xml_lines)
    return Response(content=xml_content, media_type="application/xml")


@router.get("/robots.txt", response_class=Response)
async def get_robots_txt():
    robots_content = f"""User-agent: *
Allow: /

Sitemap: {FRONTEND_URL}/sitemap.xml
"""
    return Response(content=robots_content, media_type="text/plain")
