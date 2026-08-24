import os

from supabase import AsyncClientOptions
from supabase._async.client import AsyncClient

from app.config.settings import settings


class SupabaseStorageService:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be defined")

        self.client = AsyncClient(
            supabase_url=self.url,
            supabase_key=self.key,
            options=AsyncClientOptions(postgrest_client_timeout=10),
        )
        self.bucket_name = "cv-pdfs"
        self.avatar_bucket_name = "avatars"

    async def upload_cv(self, filename: str, file_bytes: bytes) -> str:
        """Uploads CV to Supabase Storage and returns the path/filename."""
        try:
            clean_filename = os.path.basename(filename)
            await self.client.storage.from_(self.bucket_name).upload(
                path=clean_filename,
                file=file_bytes,
                file_options={"content-type": "application/pdf", "x-upsert": "true"},
            )
            return clean_filename
        except Exception as e:
            raise Exception(f"Failed to upload CV to Supabase Storage: {str(e)}")

    async def list_cvs(self):
        """Lists files in the cv-pdfs bucket."""
        try:
            res = await self.client.storage.from_(self.bucket_name).list("")
            return res
        except Exception as e:
            raise Exception(f"Failed to list CVs: {str(e)}")

    async def download_cv(self, filename: str) -> bytes:
        """Downloads CV file from Supabase Storage."""
        try:
            clean_filename = os.path.basename(filename)
            res = await self.client.storage.from_(self.bucket_name).download(
                clean_filename
            )
            return res
        except Exception as e:
            raise Exception(f"Failed to download CV: {str(e)}")

    def get_public_url(self, filename: str) -> str:
        """Gets public URL for CV file."""
        clean_filename = os.path.basename(filename)
        return self.client.storage.from_(self.bucket_name).get_public_url(
            clean_filename
        )

    async def upload_avatar(
        self, filename: str, file_bytes: bytes, content_type: str = "image/jpeg"
    ) -> str:
        """Uploads avatar image to Supabase Storage and returns the filename."""
        try:
            clean_filename = os.path.basename(filename)
            await self.client.storage.from_(self.avatar_bucket_name).upload(
                path=clean_filename,
                file=file_bytes,
                file_options={"content-type": content_type, "x-upsert": "true"},
            )
            return clean_filename
        except Exception as e:
            raise Exception(f"Failed to upload avatar to Supabase Storage: {str(e)}")

    async def download_avatar(self, filename: str) -> bytes:
        """Downloads avatar image from Supabase Storage."""
        try:
            clean_filename = os.path.basename(filename)
            res = await self.client.storage.from_(self.avatar_bucket_name).download(
                clean_filename
            )
            return res
        except Exception as e:
            raise Exception(f"Failed to download avatar: {str(e)}")

    def get_avatar_public_url(self, filename: str) -> str:
        """Gets public URL for avatar file."""
        clean_filename = os.path.basename(filename)
        return self.client.storage.from_(self.avatar_bucket_name).get_public_url(
            clean_filename
        )
