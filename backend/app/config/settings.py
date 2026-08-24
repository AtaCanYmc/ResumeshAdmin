from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost",
        "http://127.0.0.1",
    ]
    CORS_ALLOWED_ORIGINS: str = ""
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = (
        "postgresql://postgres:resumesh_dev_password_987@localhost:5432/resumesh"
    )

    # Supabase Settings
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    JWT_SECRET_KEY: str = "test-secret-key"

    # Ingestion / Scraper Settings
    GITHUB_USERNAME: str = ""
    GITHUB_PAT: str = ""
    MEDIUM_USERNAME: str = ""
    DEVTO_USERNAME: str = ""
    DEVTO_API_KEY: str = ""

    # Sentry Telemetry
    SENTRY_DSN: str = ""

    # LLM Provider Setup
    LLM_PROVIDER: str = "mock"

    # OpenAI Settings
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"

    # Groq Settings
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Ollama Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # Reactive Resume Settings
    REACTIVE_RESUME_URL: str = "https://rxresu.me"
    REACTIVE_RESUME_API_KEY: str = ""

    # Frontend settings
    FRONTEND_URL: str = "https://resumesh.dev"

    # Seed Settings
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "adminpass"

    # Redeploy Webhook Settings
    DEPLOY_WEBHOOK_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    def __init__(self, **values):
        super().__init__(**values)
        if not self.SUPABASE_JWT_SECRET:
            self.SUPABASE_JWT_SECRET = self.JWT_SECRET_KEY
        if self.ENVIRONMENT.lower() != "development":
            self.CORS_ORIGINS = [
                origin
                for origin in self.CORS_ORIGINS
                if "localhost" not in origin and "127.0.0.1" not in origin
            ]
        if self.CORS_ALLOWED_ORIGINS:
            origins = [
                o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",") if o.strip()
            ]
            for origin in origins:
                if origin not in self.CORS_ORIGINS:
                    self.CORS_ORIGINS.append(origin)


settings = Settings()
