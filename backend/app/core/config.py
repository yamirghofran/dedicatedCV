from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors_origins(v: str | List[str]) -> List[str]:
    """Parse CORS origins from environment variable."""
    if isinstance(v, str):
        if not v:
            return []
        # Split by comma
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list):
        return v
    return []


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        env_parse_none_str="null",
    )

    # Application
    APP_NAME: str = "FastAPI Backend"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "backend_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300

    # CORS - use plain string to avoid JSON parsing
    BACKEND_CORS_ORIGINS: str = ""

    # Azure Application Insights
    APPLICATIONINSIGHTS_CONNECTION_STRING: str = ""
    ENABLE_AZURE_INSIGHTS: bool = False

    # AI/LLM
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_STORAGE_ACCOUNT_NAME: str = ""
    AZURE_STORAGE_PDF_CONTAINER_NAME: str = ""
    AZURE_STORAGE_PFP_CONTAINER_NAME: str = ""

    @field_validator("BACKEND_CORS_ORIGINS", mode="after")
    @classmethod
    def parse_cors(cls, v: str) -> List[str]:
        """Convert comma-separated CORS origins to list."""
        if not v:
            return []
        return [origin.strip() for origin in v.split(",") if origin.strip()]


settings = Settings()
