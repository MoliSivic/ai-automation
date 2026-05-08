from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    app_name: str = "FlashGenius Automation API"
    environment: str = "development"

    database_url: str = (
        "postgresql+psycopg://postgres:password@localhost:5432/ai-automation-db"
    )

    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    auth_disabled: bool = False
    dev_user_id: str = "00000000-0000-4000-8000-000000000001"
    dev_user_email: str = "dev@example.com"

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash-lite"
    allowed_ai_models: str = "gemini-2.5-flash-lite,gemma-3-4b-it"

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    storage_dir: Path = Field(default=BACKEND_DIR / "storage")
    max_upload_size_mb: int = 20

    worker_user_id: str | None = None
    worker_card_count: int = 20

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def allowed_model_list(self) -> list[str]:
        return [model.strip() for model in self.allowed_ai_models.split(",") if model.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.storage_dir.mkdir(parents=True, exist_ok=True)
    (settings.storage_dir / "uploads").mkdir(parents=True, exist_ok=True)
    (settings.storage_dir / "inbox").mkdir(parents=True, exist_ok=True)
    (settings.storage_dir / "exports").mkdir(parents=True, exist_ok=True)
    return settings

