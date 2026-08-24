import mimetypes
import os

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from app.services.auth_service import SupabaseUser, get_current_admin
from app.services.supabase_storage import SupabaseStorageService
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/admin/storage", tags=["Admin Storage Management"])

ALLOWED_BUCKETS = ["cv-pdfs", "avatars"]


@router.get("/buckets")
async def get_buckets(
    admin: SupabaseUser = Depends(get_current_admin),
):
    """Returns supported Supabase Storage buckets."""
    return [
        {
            "name": "cv-pdfs",
            "description": "Stores generated & uploaded CV PDF files",
            "allowed_mime": ["application/pdf"],
        },
        {
            "name": "avatars",
            "description": "Stores user profile pictures & avatar images",
            "allowed_mime": ["image/jpeg", "image/png", "image/webp"],
        },
    ]


@router.get("/files")
async def list_storage_files(
    bucket: str = Query("cv-pdfs", description="Bucket name"),
    admin: SupabaseUser = Depends(get_current_admin),
):
    """Lists all files stored in the specified Supabase Storage bucket."""
    if bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=400, detail=f"Invalid bucket. Allowed: {ALLOWED_BUCKETS}"
        )

    try:
        storage = SupabaseStorageService()
        files = await storage.client.storage.from_(bucket).list("")

        result = []
        for f in files:
            name = f.get("name") if isinstance(f, dict) else getattr(f, "name", "")
            if not name:
                continue

            created_at = (
                f.get("created_at")
                if isinstance(f, dict)
                else getattr(f, "created_at", None)
            )
            updated_at = (
                f.get("updated_at")
                if isinstance(f, dict)
                else getattr(f, "updated_at", None)
            )

            metadata = (
                f.get("metadata") if isinstance(f, dict) else getattr(f, "metadata", {})
            )
            size = metadata.get("size") if isinstance(metadata, dict) else None

            content_type, _ = mimetypes.guess_type(name)
            if bucket == "cv-pdfs":
                public_url = f"/api/v1/cv/{name}"
            elif bucket == "avatars":
                public_url = f"/api/v1/avatar/{name}"
            else:
                public_url = storage.client.storage.from_(bucket).get_public_url(name)

            result.append(
                {
                    "name": name,
                    "bucket": bucket,
                    "created_at": created_at,
                    "updated_at": updated_at,
                    "size": size,
                    "content_type": content_type or "application/octet-stream",
                    "public_url": public_url,
                }
            )

        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list files from bucket {bucket}: {str(e)}",
        )


@router.post("/upload")
async def upload_storage_file(
    bucket: str = Query("cv-pdfs", description="Bucket name"),
    file: UploadFile = File(...),
    admin: SupabaseUser = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    """Uploads a file to the specified Supabase Storage bucket."""
    if bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=400, detail=f"Invalid bucket. Allowed: {ALLOWED_BUCKETS}"
        )

    try:
        contents = await file.read()
        clean_filename = os.path.basename(file.filename or "uploaded_file")

        storage = SupabaseStorageService()
        content_type = (
            file.content_type
            or mimetypes.guess_type(clean_filename)[0]
            or "application/octet-stream"
        )

        await storage.client.storage.from_(bucket).upload(
            path=clean_filename,
            file=contents,
            file_options={"content-type": content_type, "x-upsert": "true"},
        )

        if bucket == "cv-pdfs":
            public_url = f"/api/v1/cv/{clean_filename}"
        elif bucket == "avatars":
            public_url = f"/api/v1/avatar/{clean_filename}"
        else:
            public_url = storage.client.storage.from_(bucket).get_public_url(
                clean_filename
            )

        telemetry_ctx["background_tasks"].add_task(
            telemetry.capture_event,
            distinct_id=telemetry_ctx["ip"],
            event_name="storage_file_uploaded",
            properties={
                "bucket": bucket,
                "filename": clean_filename,
                "size": len(contents),
                "ip": telemetry_ctx["ip"],
            },
        )

        return {
            "status": "success",
            "bucket": bucket,
            "filename": clean_filename,
            "public_url": public_url,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to upload file to {bucket}: {str(e)}"
        )


@router.delete("/files")
async def delete_storage_file(
    bucket: str = Query(..., description="Bucket name"),
    filename: str = Query(..., description="File name to delete"),
    admin: SupabaseUser = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    """Deletes a file from the specified Supabase Storage bucket."""
    if bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=400, detail=f"Invalid bucket. Allowed: {ALLOWED_BUCKETS}"
        )

    try:
        clean_filename = os.path.basename(filename)
        storage = SupabaseStorageService()
        await storage.client.storage.from_(bucket).remove([clean_filename])

        telemetry_ctx["background_tasks"].add_task(
            telemetry.capture_event,
            distinct_id=telemetry_ctx["ip"],
            event_name="storage_file_deleted",
            properties={
                "bucket": bucket,
                "filename": clean_filename,
                "ip": telemetry_ctx["ip"],
            },
        )

        return {
            "status": "success",
            "message": f"Deleted {clean_filename} from {bucket}",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete file {filename}: {str(e)}"
        )
