from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from resumesh_scrapers import DevToScraper, MediumScraper

from app.db.dependencies import get_article_repo
from app.db.repositories import IArticleRepository
from app.schemas.article import ArticleCreate, ArticleResponse, ArticleUpdate
from app.services.auth_service import get_current_admin
from app.services.ingestion_service import IngestionService
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/articles", tags=["articles"])


class ArticleRefreshRequest(BaseModel):
    username: str
    platform: str  # "devto" or "medium"
    api_key: str | None = None


@router.post("/refresh", response_model=dict)
async def refresh_articles(
    request: ArticleRefreshRequest,
    background_tasks: BackgroundTasks,
    provider: IArticleRepository = Depends(get_article_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    try:
        ingestion = IngestionService()
        if request.platform.lower() == "devto":
            scraper = DevToScraper()
            background_tasks.add_task(
                ingestion.fetch_devto_articles,
                scraper=scraper,
                username=request.username,
                provider=provider,
                api_key=request.api_key,
            )
        elif request.platform.lower() == "medium":
            scraper = MediumScraper()
            background_tasks.add_task(
                ingestion.fetch_medium_articles,
                scraper=scraper,
                username=request.username,
                provider=provider,
            )
        else:
            raise HTTPException(
                status_code=400, detail="Invalid platform. Use 'devto' or 'medium'."
            )

        telemetry_ctx["background_tasks"].add_task(
            telemetry.capture_event,
            distinct_id=telemetry_ctx["ip"],
            event_name="articles_refresh_triggered",
            properties={
                "username": request.username,
                "platform": request.platform,
                "ip": telemetry_ctx["ip"],
                "user_agent": telemetry_ctx["ua"],
            },
        )

        return {
            "status": "processing",
            "message": f"Articles from {request.platform} "
            f"ingestion started in background",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=ArticleResponse)
async def create_article(
    article: ArticleCreate,
    provider: IArticleRepository = Depends(get_article_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    try:
        result = await provider.upsert_article(article)
        telemetry_ctx["background_tasks"].add_task(
            telemetry.capture_event,
            distinct_id=telemetry_ctx["ip"],
            event_name="article_created",
            properties={
                "article_id": result.id if hasattr(result, "id") else None,
                "title": article.title,
                "ip": telemetry_ctx["ip"],
                "user_agent": telemetry_ctx["ua"],
            },
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    skip: int = 0,
    limit: int = 100,
    provider: IArticleRepository = Depends(get_article_repo),
):
    try:
        articles = await provider.get_all_articles(skip=skip, limit=limit)
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    article: ArticleUpdate,
    provider: IArticleRepository = Depends(get_article_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    updated = await provider.update_article(article_id, article)
    if not updated:
        raise HTTPException(status_code=404, detail="Article not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="article_updated",
        properties={
            "article_id": article_id,
            "title": getattr(updated, "title", None),
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return updated


@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    provider: IArticleRepository = Depends(get_article_repo),
    admin: dict = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    deleted = await provider.delete_article(article_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Article not found")
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="article_deleted",
        properties={
            "article_id": article_id,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return {"status": "success"}
