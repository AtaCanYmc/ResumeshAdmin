import mimetypes
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.auth_service import SupabaseUser, get_current_admin
from app.services.settings_store import get_setting, set_setting
from app.services.supabase_storage import SupabaseStorageService
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/avatar", tags=["Avatar Storage"])


@router.get("/{filename}")
async def get_avatar(filename: str, telemetry_ctx: dict = Depends(get_telemetry_data)):
    try:
        storage = SupabaseStorageService()
        file_bytes = await storage.download_avatar(filename)

        content_type, _ = mimetypes.guess_type(filename)
        if not content_type:
            content_type = "image/jpeg"

        telemetry_ctx["background_tasks"].add_task(
            telemetry.capture_event,
            distinct_id=telemetry_ctx["ip"],
            event_name="avatar_viewed",
            properties={
                "filename": filename,
                "ip": telemetry_ctx["ip"],
                "user_agent": telemetry_ctx["ua"],
                "url": telemetry_ctx["url"],
            },
        )
        return Response(
            content=file_bytes,
            media_type=content_type,
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except Exception as e:
        if filename in ["profile_pic.jpeg", "profile_pic.jpg", "profile_pic.png"]:
            from fastapi.responses import RedirectResponse

            return RedirectResponse(url="/images/profile_pic.jpeg", status_code=307)
        raise HTTPException(
            status_code=404, detail=f"Profile picture not found: {str(e)}"
        )


@router.get("/{filename}/url")
async def get_avatar_url(
    filename: str, telemetry_ctx: dict = Depends(get_telemetry_data)
):
    try:
        storage = SupabaseStorageService()
        public_url = storage.get_avatar_public_url(filename)
        return {"filename": filename, "url": public_url}
    except Exception as e:
        raise HTTPException(
            status_code=404, detail=f"Failed to get avatar URL: {str(e)}"
        )


@router.post("/upload")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: SupabaseUser = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Only image files (JPEG, PNG, WebP) are allowed"
        )

    try:
        contents = await file.read()
        ext = mimetypes.guess_extension(file.content_type) or ".jpg"
        unique_filename = f"avatar_{uuid.uuid4().hex[:8]}{ext}"

        storage = SupabaseStorageService()
        uploaded_filename = await storage.upload_avatar(
            filename=unique_filename,
            file_bytes=contents,
            content_type=file.content_type,
        )

        avatar_url = f"/api/v1/avatar/{uploaded_filename}"

        # Update hero avatarImage setting in both EN and TR settings
        for lang_key in ["en", "tr"]:
            current_lang = get_setting(db, lang_key, {})
            if isinstance(current_lang, dict):
                hero = current_lang.get("hero", {})
                hero["avatarImage"] = avatar_url
                current_lang["hero"] = hero
                set_setting(db, lang_key, current_lang, commit=False)

        db.commit()

        telemetry_ctx["background_tasks"].add_task(
            telemetry.capture_event,
            distinct_id=telemetry_ctx["ip"],
            event_name="avatar_uploaded",
            properties={
                "filename": uploaded_filename,
                "url": avatar_url,
                "ip": telemetry_ctx["ip"],
                "user_agent": telemetry_ctx["ua"],
            },
        )

        return {
            "status": "success",
            "filename": uploaded_filename,
            "url": avatar_url,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to upload profile picture: {str(e)}"
        )
