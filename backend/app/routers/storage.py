import mimetypes
import os

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from app.config.settings import settings
from app.services.auth_service import SupabaseUser, get_current_admin
from app.services.supabase_storage import SupabaseStorageService
from app.services.telemetry_service import get_telemetry_data, telemetry

router = APIRouter(prefix="/admin/storage", tags=["Admin Storage Management"])

ALLOWED_BUCKETS = ["cv-pdfs", "cvs", "avatars"]


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
            "name": "cvs",
            "description": "Stores client resume files",
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
    """Lists all files stored in the specified Supabase Storage bucket with local fallback."""
    if bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=400, detail=f"Invalid bucket. Allowed: {ALLOWED_BUCKETS}"
        )

    result = []
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            storage = SupabaseStorageService()
            files = await storage.client.storage.from_(bucket).list("")

            if isinstance(files, list):
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
                        f.get("metadata")
                        if isinstance(f, dict)
                        else getattr(f, "metadata", {})
                    )
                    size = metadata.get("size") if isinstance(metadata, dict) else None

                    content_type, _ = mimetypes.guess_type(name)
                    if bucket in ["cv-pdfs", "cvs"]:
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
        except Exception as e:
            print(f"[Storage Warning] Could not list Supabase bucket '{bucket}': {e}")

    # Fallback to local files if Supabase storage is empty or unconfigured
    if not result:
        local_files = []
        if bucket in ["cv-pdfs", "cvs"]:
            resumes_dir = os.path.join(os.getcwd(), "resumes")
            if os.path.exists(resumes_dir):
                for fname in os.listdir(resumes_dir):
                    if fname.endswith(".pdf"):
                        fpath = os.path.join(resumes_dir, fname)
                        stat = os.stat(fpath)
                        local_files.append(
                            {
                                "name": fname,
                                "bucket": bucket,
                                "created_at": None,
                                "updated_at": None,
                                "size": stat.st_size,
                                "content_type": "application/pdf",
                                "public_url": f"/api/v1/cv/{fname}",
                            }
                        )
        elif bucket == "avatars":
            for fname in ["profile.jpg", "avatar.png"]:
                fpath = os.path.join(os.getcwd(), fname)
                if os.path.exists(fpath):
                    stat = os.stat(fpath)
                    content_type, _ = mimetypes.guess_type(fname)
                    local_files.append(
                        {
                            "name": fname,
                            "bucket": bucket,
                            "created_at": None,
                            "updated_at": None,
                            "size": stat.st_size,
                            "content_type": content_type or "image/jpeg",
                            "public_url": f"/api/v1/avatar/{fname}",
                        }
                    )
        result = local_files

    return result


@router.post("/upload")
async def upload_storage_file(
    bucket: str = Query("cv-pdfs", description="Bucket name"),
    file: UploadFile = File(...),
    admin: SupabaseUser = Depends(get_current_admin),
    telemetry_ctx: dict = Depends(get_telemetry_data),
):
    """Uploads a file to the specified Supabase Storage bucket and local fallback directory."""
    if bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=400, detail=f"Invalid bucket. Allowed: {ALLOWED_BUCKETS}"
        )

    try:
        contents = await file.read()
        clean_filename = os.path.basename(file.filename or "uploaded_file")
        content_type = (
            file.content_type
            or mimetypes.guess_type(clean_filename)[0]
            or "application/octet-stream"
        )

        supabase_synced = False
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                storage = SupabaseStorageService()
                await storage.client.storage.from_(bucket).upload(
                    path=clean_filename,
                    file=contents,
                    file_options={"content-type": content_type, "x-upsert": "true"},
                )
                supabase_synced = True
            except Exception as se:
                print(f"[Storage Upload Warning] Supabase sync failed: {se}")

        # Always save a local copy as backup
        if bucket in ["cv-pdfs", "cvs"]:
            resumes_dir = os.path.join(os.getcwd(), "resumes")
            os.makedirs(resumes_dir, exist_ok=True)
            with open(os.path.join(resumes_dir, clean_filename), "wb") as f:
                f.write(contents)
        elif bucket == "avatars":
            with open(os.path.join(os.getcwd(), clean_filename), "wb") as f:
                f.write(contents)

        public_url = (
            f"/api/v1/cv/{clean_filename}"
            if bucket in ["cv-pdfs", "cvs"]
            else f"/api/v1/avatar/{clean_filename}"
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
            "supabase_synced": supabase_synced,
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
    """Deletes a file from the specified Supabase Storage bucket and local fallback directory."""
    if bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=400, detail=f"Invalid bucket. Allowed: {ALLOWED_BUCKETS}"
        )

    try:
        clean_filename = os.path.basename(filename)

        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                storage = SupabaseStorageService()
                await storage.client.storage.from_(bucket).remove([clean_filename])
            except Exception as se:
                print(f"[Storage Delete Warning] Supabase delete failed: {se}")

        # Delete local copy if present
        if bucket in ["cv-pdfs", "cvs"]:
            local_path = os.path.join(os.getcwd(), "resumes", clean_filename)
            if os.path.exists(local_path):
                os.remove(local_path)
        elif bucket == "avatars":
            local_path = os.path.join(os.getcwd(), clean_filename)
            if os.path.exists(local_path):
                os.remove(local_path)

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
