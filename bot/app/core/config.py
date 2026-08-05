from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Talora Apply Bot"
    app_env: str = "local"
    app_host: str = "127.0.0.1"
    app_port: int = 9000
    bot_service_token: str = Field(min_length=16)
    bot_signing_secret: str = Field(min_length=32)
    signature_max_age_seconds: int = Field(default=60, ge=10, le=300)
    max_file_size_mb: int = Field(default=10, ge=1, le=25)
    max_pdf_pages: int = Field(default=50, ge=1, le=200)
    max_docx_uncompressed_mb: int = Field(default=50, ge=1, le=200)

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @property
    def max_docx_uncompressed_bytes(self) -> int:
        return self.max_docx_uncompressed_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
