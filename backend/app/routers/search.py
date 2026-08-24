from fastapi import APIRouter, Depends, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.db.dependencies import get_search_repo
from app.db.repositories import ISearchRepository
from app.schemas.search import GlobalSearchResponse
from app.services.telemetry_service import get_telemetry_data, telemetry

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/search", tags=["Global Search"])


@router.get("/", response_model=GlobalSearchResponse)
@limiter.limit("60/minute")
async def global_search(
    request: Request,
    q: str = Query(None, min_length=2, description="Search keyword"),
    query: str = Query(None, min_length=2, description="Search keyword alias"),
    provider: ISearchRepository = Depends(get_search_repo),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    """
    Performs global search across Projects, Articles, Experiences and Certificates.
    Uses Database Agnostic architecture.
    """
    keyword = q or query
    if not keyword:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=422,
            detail=(
                "Search query parameter 'q' or 'query' "
                "is required with min length 2."
            ),
        )

    results = await provider.global_search(keyword)
    telemetry_ctx["background_tasks"].add_task(
        telemetry.capture_event,
        distinct_id=telemetry_ctx["ip"],
        event_name="search_performed",
        properties={
            "query": keyword,
            "ip": telemetry_ctx["ip"],
            "user_agent": telemetry_ctx["ua"],
        },
    )
    return results
