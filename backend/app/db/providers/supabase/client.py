from supabase import AsyncClientOptions
from supabase._async.client import AsyncClient

from app.config.settings import settings


class SupabaseClientManager:
    _client = None

    @classmethod
    def get_client(cls) -> AsyncClient:
        if cls._client is None:
            url = settings.SUPABASE_URL
            key = settings.SUPABASE_KEY
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be defined!")
            cls._client = AsyncClient(
                supabase_url=url,
                supabase_key=key,
                options=AsyncClientOptions(postgrest_client_timeout=10),
            )
        return cls._client
