import logging
from typing import Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.config.settings import settings as app_settings
from app.schemas.app_settings import AppSettingsResponse, AppSettingsUpdate
from app.services.auth_service import SupabaseUser, get_current_admin
from app.services.settings_store import ensure_defaults, get_all_settings, set_setting

logger = logging.getLogger("settings")
router = APIRouter(prefix="/settings", tags=["Settings"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _mask_key(key: Optional[str]) -> str:
    """Return '***' when a non-empty API key is stored, else empty string."""
    if key and key.strip():
        return "*" * len(key)
    return ""


def _build_response(raw: dict) -> dict:
    """Convert the flat {key: value} dict from the KV store into the
    structured response expected by the frontend.

    API contract is preserved — the shape matches the old wide-table response.
    """
    return {
        "sections": raw.get("sections"),
        "socials": raw.get("socials"),
        "footer": raw.get("footer"),
        "marquee": raw.get("marquee"),
        "en": raw.get("en"),
        "tr": raw.get("tr"),
        "integrations": raw.get("integrations"),
        "llm": raw.get("llm"),
    }


def trigger_redeploy_webhook() -> None:
    webhook_url = app_settings.DEPLOY_WEBHOOK_URL
    if not webhook_url:
        return
    logger.info(f"Triggering deploy webhook to {webhook_url} ...")
    try:
        response = httpx.post(webhook_url, timeout=10.0)
        logger.info(f"Deploy webhook response: {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to trigger deploy webhook: {e}")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get("/", response_model=AppSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    admin: SupabaseUser = Depends(get_current_admin),
):
    ensure_defaults(db)
    raw = get_all_settings(db)
    return _build_response(raw)


@router.patch("/", response_model=AppSettingsResponse)
def update_settings(
    payload: AppSettingsUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: SupabaseUser = Depends(get_current_admin),
):
    ensure_defaults(db)

    update_data = payload.dict(exclude_unset=True)

    # Persist each changed key individually (no commit per call, batch at end)
    for key, value in update_data.items():
        set_setting(db, key, value, commit=False)

    db.commit()

    from app.llm.factory import reset_llm_client

    reset_llm_client()

    if app_settings.DEPLOY_WEBHOOK_URL:
        background_tasks.add_task(trigger_redeploy_webhook)

    raw = get_all_settings(db)
    return _build_response(raw)
