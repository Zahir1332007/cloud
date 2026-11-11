from pathlib import Path
from typing import List
from urllib.parse import quote, quote_plus, urlencode
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BACKEND_DIR.parent


def _resolve_cert_path(raw_path: str) -> str:
    """Resolve a certificate path relative to cwd, backend/, or project root."""
    if not raw_path:
        return ""
    candidate = Path(raw_path)
    if candidate.is_absolute() or candidate.exists():
        return candidate.resolve().as_posix() if candidate.exists() else raw_path
    for base_dir in (BACKEND_DIR, ROOT_DIR):
        joined = (base_dir / raw_path).resolve()
        if joined.exists():
            return joined.as_posix()
    return raw_path


class Settings(BaseSettings):
    """Centralized application settings loaded from environment variables and .env files."""

    PROJECT_NAME: str = "CloudStore API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # JWT Security
    SECRET_KEY: str = "super-secret-key-change-in-production-aws-cloudstore-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database Credentials (supports both separate DB_* fields and full DATABASE_URL)
    DB_HOST: str = ""
    DB_PORT: str = "5432"
    DB_NAME: str = "postgres"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DB_SSLMODE: str = "verify-full"
    DB_SSLROOTCERT: str = "./global-bundle.pem"

    DATABASE_URL: str = ""
    SQLITE_FALLBACK_URL: str = "sqlite:///./cloudstore.db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:80",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",
    ]

    model_config = SettingsConfigDict(
        env_file=(str(ROOT_DIR / ".env"), str(BACKEND_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @model_validator(mode="after")
    def assemble_database_url(self) -> "Settings":
        """Build DATABASE_URL from separated DB_* fields when DATABASE_URL is not explicitly provided."""
        if not self.DATABASE_URL and self.DB_HOST:
            user = quote_plus(self.DB_USER)
            password = quote_plus(self.DB_PASSWORD)
            port = self.DB_PORT or "5432"
            url = f"postgresql://{user}:{password}@{self.DB_HOST}:{port}/{self.DB_NAME}"

            query_params = {}
            if self.DB_SSLMODE:
                query_params["sslmode"] = self.DB_SSLMODE
            if self.DB_SSLROOTCERT and self.DB_SSLMODE not in ("disable", "allow"):
                resolved_cert = _resolve_cert_path(self.DB_SSLROOTCERT)
                if resolved_cert:
                    query_params["sslrootcert"] = resolved_cert

            if query_params:
                url = f"{url}?{urlencode(query_params, quote_via=quote)}"
            self.DATABASE_URL = url
        elif not self.DATABASE_URL:
            self.DATABASE_URL = "postgresql://postgres:postgres123@localhost:5432/cloudstore"
        return self


settings = Settings()

