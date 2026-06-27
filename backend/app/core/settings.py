from typing import Literal

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "AskLake API"
    metadata_url: str = "sqlite:///data/asklake.db"
    result_store_path: str = "data/results"
    week2_sql_engine: Literal["fake", "duckdb"] = "fake"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:13000",
        "http://127.0.0.1:13000",
    ]


def get_settings() -> Settings:
    return Settings()
