import os
from typing import Literal

from pydantic import BaseModel


def _int_from_env(name: str, default: int) -> int:
    value = os.environ.get(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


class Settings(BaseModel):
    app_name: str = "AskLake API"
    metadata_url: str = "sqlite:///data/asklake.db"
    result_store_path: str = "data/results"
    week2_sql_engine: Literal["duckdb", "fake"] = "duckdb"
    week2_llm_provider: Literal["template", "openai"] = "template"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    openai_timeout_seconds: int = 30
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:13000",
        "http://127.0.0.1:13000",
    ]


def get_settings() -> Settings:
    return Settings(
        week2_sql_engine=os.environ.get("WEEK2_SQL_ENGINE", "duckdb"),
        week2_llm_provider=os.environ.get("WEEK2_LLM_PROVIDER", "template"),
        openai_api_key=os.environ.get("OPENAI_API_KEY") or None,
        openai_model=os.environ.get("OPENAI_MODEL", "gpt-4.1-mini"),
        openai_base_url=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        openai_timeout_seconds=_int_from_env("OPENAI_TIMEOUT_SECONDS", 30),
    )
