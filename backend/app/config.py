from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    MOCK_LLM_MODE: bool = True
    AUTO_APPROVAL_THRESHOLD_INR: float = 25000.0
    MIN_CONFIDENCE_THRESHOLD: float = 0.75
    MOCK_ERP_URL: str = "http://localhost:8001"
    DATABASE_URL: str = "sqlite+aiosqlite:///./reconciler.db"
    GEMINI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gemini-1.5-flash"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
