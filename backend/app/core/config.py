from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field
import json


class Settings(BaseSettings):
    PROJECT_NAME: str = "DayFlow API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "dayflow-dev-secret-key-change-in-production-32bytes"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "dayflow_db"

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return "sqlite+aiosqlite:///./dayflow.db"

    # CORS
    BACKEND_CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    @computed_field
    @property
    def cors_origins(self) -> list[str]:
        return json.loads(self.BACKEND_CORS_ORIGINS)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
