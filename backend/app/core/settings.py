from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "AskLake API"
    metadata_url: str = "sqlite:///data/asklake.db"
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
