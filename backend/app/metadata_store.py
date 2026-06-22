import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Protocol

from app.schemas import CatalogDataset, ColumnSchema, SourceCreate, SourceRecord


class MetadataStore(Protocol):
    def initialize(self) -> None: ...
    def create_source_with_dataset(
        self,
        source: SourceCreate,
        schema: list[ColumnSchema],
        row_count: int,
        sample: list[dict[str, object]],
    ) -> tuple[SourceRecord, CatalogDataset]: ...
    def list_sources(self) -> list[SourceRecord]: ...
    def get_source(self, source_id: str) -> SourceRecord | None: ...
    def list_catalog_datasets(self) -> list[CatalogDataset]: ...
    def get_catalog_dataset(self, dataset_id: str) -> CatalogDataset | None: ...


class SQLiteMetadataStore:
    def __init__(self, url: str | None = None) -> None:
        self.database_path = sqlite_path_from_url(
            url or os.getenv("ASKLAKE_METADATA_URL", "sqlite:///data/asklake.db")
        )

    def initialize(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS sources (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    type TEXT NOT NULL,
                    path TEXT NOT NULL,
                    status TEXT NOT NULL,
                    dataset_id TEXT,
                    error_message TEXT,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS catalog_datasets (
                    id TEXT PRIMARY KEY,
                    source_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    path TEXT NOT NULL,
                    schema_json TEXT NOT NULL,
                    row_count INTEGER NOT NULL,
                    sample_json TEXT NOT NULL,
                    status TEXT NOT NULL,
                    error_message TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(source_id) REFERENCES sources(id)
                );
                """
            )

    def create_source_with_dataset(
        self,
        source: SourceCreate,
        schema: list[ColumnSchema],
        row_count: int,
        sample: list[dict[str, object]],
    ) -> tuple[SourceRecord, CatalogDataset]:
        source_id = str(uuid.uuid4())
        dataset_id = str(uuid.uuid4())
        created_at = now_iso()

        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO sources (id, name, type, path, status, dataset_id, error_message, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (source_id, source.name, source.type, source.path, "ready", dataset_id, None, created_at),
            )
            connection.execute(
                """
                INSERT INTO catalog_datasets (
                    id, source_id, name, source_type, path, schema_json, row_count,
                    sample_json, status, error_message, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    dataset_id,
                    source_id,
                    source.name,
                    source.type,
                    source.path,
                    json.dumps([column.model_dump() for column in schema], ensure_ascii=False),
                    row_count,
                    json.dumps(sample, ensure_ascii=False),
                    "ready",
                    None,
                    created_at,
                ),
            )

        return self.get_source(source_id), self.get_catalog_dataset(dataset_id)  # type: ignore[return-value]

    def list_sources(self) -> list[SourceRecord]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM sources ORDER BY created_at DESC").fetchall()
        return [source_from_row(row) for row in rows]

    def get_source(self, source_id: str) -> SourceRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM sources WHERE id = ?", (source_id,)).fetchone()
        return source_from_row(row) if row else None

    def list_catalog_datasets(self) -> list[CatalogDataset]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM catalog_datasets ORDER BY created_at DESC").fetchall()
        return [dataset_from_row(row) for row in rows]

    def get_catalog_dataset(self, dataset_id: str) -> CatalogDataset | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM catalog_datasets WHERE id = ?", (dataset_id,)).fetchone()
        return dataset_from_row(row) if row else None

    def connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection


def sqlite_path_from_url(url: str) -> Path:
    if url == "sqlite:///:memory:":
        return Path(":memory:")
    if url.startswith("sqlite:///"):
        return Path(url.removeprefix("sqlite:///"))
    return Path(url)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def source_from_row(row: sqlite3.Row) -> SourceRecord:
    return SourceRecord(
        id=row["id"],
        name=row["name"],
        type=row["type"],
        path=row["path"],
        status=row["status"],
        dataset_id=row["dataset_id"],
        error_message=row["error_message"],
        created_at=row["created_at"],
    )


def dataset_from_row(row: sqlite3.Row) -> CatalogDataset:
    return CatalogDataset(
        id=row["id"],
        source_id=row["source_id"],
        name=row["name"],
        source_type=row["source_type"],
        path=row["path"],
        columns=[ColumnSchema(**item) for item in json.loads(row["schema_json"])],
        row_count=row["row_count"],
        sample=json.loads(row["sample_json"]),
        status=row["status"],
        error_message=row["error_message"],
        created_at=row["created_at"],
    )
