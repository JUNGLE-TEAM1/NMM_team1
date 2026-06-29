import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.domain.schemas import (
    CatalogDataset,
    ColumnSchema,
    PipelineCreate,
    PipelineRecord,
    PipelineRunRecord,
    SourceCreate,
    SourceDatasetCreate,
    SourceDatasetRecord,
    SourceRecord,
    TargetDatasetCreate,
    TargetDatasetRecord,
    TargetDatasetRunRecord,
)


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
                    owner TEXT NOT NULL DEFAULT 'unassigned',
                    trust_status TEXT NOT NULL DEFAULT 'Draft',
                    trust_gate_result_json TEXT,
                    error_message TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(source_id) REFERENCES sources(id)
                );

                CREATE TABLE IF NOT EXISTS source_datasets (
                    id TEXT PRIMARY KEY,
                    connection_id TEXT NOT NULL,
                    connection_name TEXT NOT NULL,
                    connection_type TEXT NOT NULL,
                    name TEXT NOT NULL UNIQUE,
                    raw_scope TEXT NOT NULL,
                    resource_label TEXT NOT NULL,
                    schema_preview_json TEXT NOT NULL,
                    layer TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS pipelines (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    source_dataset_id TEXT NOT NULL,
                    select_fields_json TEXT NOT NULL,
                    target_name TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(source_dataset_id) REFERENCES catalog_datasets(id)
                );

                CREATE TABLE IF NOT EXISTS target_datasets (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT NOT NULL,
                    source_dataset_id TEXT NOT NULL,
                    source_dataset_name TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    selected_fields_json TEXT NOT NULL,
                    process_rule_json TEXT NOT NULL,
                    schedule_json TEXT NOT NULL,
                    output_schema_json TEXT NOT NULL,
                    job_definition_json TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(source_dataset_id) REFERENCES source_datasets(id)
                );

                CREATE TABLE IF NOT EXISTS target_dataset_runs (
                    id TEXT PRIMARY KEY,
                    target_dataset_id TEXT NOT NULL,
                    target_dataset_name TEXT NOT NULL,
                    week2_run_id TEXT NOT NULL,
                    pipeline_id TEXT NOT NULL,
                    executor TEXT NOT NULL,
                    status TEXT NOT NULL,
                    job_definition_json TEXT NOT NULL,
                    execution_result_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(target_dataset_id) REFERENCES target_datasets(id)
                );

                CREATE TABLE IF NOT EXISTS pipeline_runs (
                    id TEXT PRIMARY KEY,
                    pipeline_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    result_dataset_id TEXT,
                    result_location TEXT,
                    row_count INTEGER,
                    error_message TEXT,
                    logs_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(pipeline_id) REFERENCES pipelines(id),
                    FOREIGN KEY(result_dataset_id) REFERENCES catalog_datasets(id)
                );
                """
            )
            ensure_column(connection, "catalog_datasets", "owner", "TEXT NOT NULL DEFAULT 'unassigned'")
            ensure_column(connection, "catalog_datasets", "trust_status", "TEXT NOT NULL DEFAULT 'Draft'")
            ensure_column(connection, "catalog_datasets", "trust_gate_result_json", "TEXT")

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
                    sample_json, status, owner, trust_status, trust_gate_result_json, error_message, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    "unassigned",
                    "Draft",
                    json.dumps(default_trust_gate_result(dataset_id), ensure_ascii=False),
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

    def create_source_dataset(self, dataset: SourceDatasetCreate) -> SourceDatasetRecord:
        dataset_id = str(uuid.uuid4())
        created_at = now_iso()
        schema_preview = json.dumps(
            [column.model_dump() for column in dataset.schema_preview],
            ensure_ascii=False,
        )

        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO source_datasets (
                    id, connection_id, connection_name, connection_type, name, raw_scope,
                    resource_label, schema_preview_json, layer, status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    dataset_id,
                    dataset.connection_id,
                    dataset.connection_name,
                    dataset.connection_type,
                    dataset.name,
                    dataset.raw_scope,
                    dataset.resource_label,
                    schema_preview,
                    "source",
                    "metadata_ready",
                    created_at,
                    created_at,
                ),
            )

        return self.get_source_dataset(dataset_id)  # type: ignore[return-value]

    def list_source_datasets(self) -> list[SourceDatasetRecord]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM source_datasets ORDER BY created_at DESC").fetchall()
        return [source_dataset_from_row(row) for row in rows]

    def get_source_dataset(self, dataset_id: str) -> SourceDatasetRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM source_datasets WHERE id = ?", (dataset_id,)).fetchone()
        return source_dataset_from_row(row) if row else None

    def create_target_dataset(self, dataset: TargetDatasetCreate) -> TargetDatasetRecord:
        dataset_id = str(uuid.uuid4())
        created_at = now_iso()
        selected_fields = list(dict.fromkeys(dataset.selected_fields))
        output_schema = [column.model_dump() for column in dataset.output_schema]
        process_rule = {
            **dataset.process_rule,
            "selected_fields": selected_fields,
        }
        schedule = dataset.schedule
        job_definition = {
            "job_type": "target_dataset_etl_draft",
            "target_dataset_id": dataset_id,
            "target_dataset_name": dataset.name,
            "source_dataset_id": dataset.source_dataset_id,
            "source_dataset_name": dataset.source_dataset_name,
            "source_type": dataset.source_type,
            "process_rule": process_rule,
            "selected_fields": selected_fields,
            "schedule": schedule,
            "output_schema": output_schema,
            "status": "draft",
        }

        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO target_datasets (
                    id, name, description, source_dataset_id, source_dataset_name, source_type,
                    selected_fields_json, process_rule_json, schedule_json, output_schema_json,
                    job_definition_json, status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    dataset_id,
                    dataset.name,
                    dataset.description,
                    dataset.source_dataset_id,
                    dataset.source_dataset_name,
                    dataset.source_type,
                    json.dumps(selected_fields, ensure_ascii=False),
                    json.dumps(process_rule, ensure_ascii=False),
                    json.dumps(schedule, ensure_ascii=False),
                    json.dumps(output_schema, ensure_ascii=False),
                    json.dumps(job_definition, ensure_ascii=False),
                    "draft",
                    created_at,
                    created_at,
                ),
            )

        return self.get_target_dataset(dataset_id)  # type: ignore[return-value]

    def list_target_datasets(self) -> list[TargetDatasetRecord]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM target_datasets ORDER BY created_at DESC").fetchall()
        return [target_dataset_from_row(row) for row in rows]

    def get_target_dataset(self, dataset_id: str) -> TargetDatasetRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM target_datasets WHERE id = ?", (dataset_id,)).fetchone()
        return target_dataset_from_row(row) if row else None

    def create_target_dataset_run(
        self,
        target_dataset: TargetDatasetRecord,
        execution_result: dict[str, object],
    ) -> TargetDatasetRunRecord:
        run_record_id = str(uuid.uuid4())
        created_at = now_iso()
        week2_run_id = str(execution_result["run_id"])
        pipeline_id = str(execution_result["pipeline_id"])
        executor = str(execution_result["executor"])
        status = str(execution_result["status"])

        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO target_dataset_runs (
                    id, target_dataset_id, target_dataset_name, week2_run_id, pipeline_id,
                    executor, status, job_definition_json, execution_result_json, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    run_record_id,
                    target_dataset.id,
                    target_dataset.name,
                    week2_run_id,
                    pipeline_id,
                    executor,
                    status,
                    json.dumps(target_dataset.job_definition, ensure_ascii=False),
                    json.dumps(execution_result, ensure_ascii=False),
                    created_at,
                    created_at,
                ),
            )

        return self.get_target_dataset_run(run_record_id)  # type: ignore[return-value]

    def list_target_dataset_runs(self, target_dataset_id: str) -> list[TargetDatasetRunRecord]:
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM target_dataset_runs WHERE target_dataset_id = ? ORDER BY created_at DESC",
                (target_dataset_id,),
            ).fetchall()
        return [target_dataset_run_from_row(row) for row in rows]

    def get_target_dataset_run(self, run_record_id: str) -> TargetDatasetRunRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM target_dataset_runs WHERE id = ?", (run_record_id,)).fetchone()
        return target_dataset_run_from_row(row) if row else None

    def list_catalog_datasets(self) -> list[CatalogDataset]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM catalog_datasets ORDER BY created_at DESC").fetchall()
        return [dataset_from_row(row) for row in rows]

    def get_catalog_dataset(self, dataset_id: str) -> CatalogDataset | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM catalog_datasets WHERE id = ?", (dataset_id,)).fetchone()
        return dataset_from_row(row) if row else None

    def update_catalog_dataset_trust(
        self,
        dataset_id: str,
        owner: str,
        trust_status: str,
        trust_gate_result: dict[str, object],
    ) -> CatalogDataset | None:
        with self.connect() as connection:
            connection.execute(
                """
                UPDATE catalog_datasets
                SET owner = ?,
                    trust_status = ?,
                    trust_gate_result_json = ?
                WHERE id = ?
                """,
                (
                    owner,
                    trust_status,
                    json.dumps(trust_gate_result, ensure_ascii=False),
                    dataset_id,
                ),
            )
        return self.get_catalog_dataset(dataset_id)

    def create_pipeline(self, pipeline: PipelineCreate) -> PipelineRecord:
        pipeline_id = str(uuid.uuid4())
        created_at = now_iso()

        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO pipelines (id, name, source_dataset_id, select_fields_json, target_name, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    pipeline_id,
                    pipeline.name,
                    pipeline.source_dataset_id,
                    json.dumps(pipeline.select_fields, ensure_ascii=False),
                    pipeline.target_name,
                    created_at,
                ),
            )

        return self.get_pipeline(pipeline_id)  # type: ignore[return-value]

    def list_pipelines(self) -> list[PipelineRecord]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM pipelines ORDER BY created_at DESC").fetchall()
        return [pipeline_from_row(row) for row in rows]

    def get_pipeline(self, pipeline_id: str) -> PipelineRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM pipelines WHERE id = ?", (pipeline_id,)).fetchone()
        return pipeline_from_row(row) if row else None

    def create_pipeline_run(self, pipeline_id: str) -> PipelineRunRecord:
        run_id = str(uuid.uuid4())
        created_at = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO pipeline_runs (
                    id, pipeline_id, status, result_dataset_id, result_location, row_count,
                    error_message, logs_json, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (run_id, pipeline_id, "queued", None, None, None, None, "[]", created_at, created_at),
            )
        return self.get_pipeline_run(run_id)  # type: ignore[return-value]

    def update_pipeline_run(
        self,
        run_id: str,
        status: str,
        result_dataset_id: str | None = None,
        result_location: str | None = None,
        row_count: int | None = None,
        error_message: str | None = None,
        logs: list[str] | None = None,
    ) -> PipelineRunRecord:
        updated_at = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                UPDATE pipeline_runs
                SET status = ?,
                    result_dataset_id = ?,
                    result_location = ?,
                    row_count = ?,
                    error_message = ?,
                    logs_json = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                (
                    status,
                    result_dataset_id,
                    result_location,
                    row_count,
                    error_message,
                    json.dumps(logs or [], ensure_ascii=False),
                    updated_at,
                    run_id,
                ),
            )
        return self.get_pipeline_run(run_id)  # type: ignore[return-value]

    def get_pipeline_run(self, run_id: str) -> PipelineRunRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM pipeline_runs WHERE id = ?", (run_id,)).fetchone()
        return pipeline_run_from_row(row) if row else None

    def create_result_dataset(
        self,
        name: str,
        source_id: str,
        source_type: str,
        path: str,
        schema: list[ColumnSchema],
        row_count: int,
        sample: list[dict[str, object]],
    ) -> CatalogDataset:
        dataset_id = str(uuid.uuid4())
        created_at = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO catalog_datasets (
                    id, source_id, name, source_type, path, schema_json, row_count,
                    sample_json, status, owner, trust_status, trust_gate_result_json, error_message, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    dataset_id,
                    source_id,
                    name,
                    source_type,
                    path,
                    json.dumps([column.model_dump() for column in schema], ensure_ascii=False),
                    row_count,
                    json.dumps(sample, ensure_ascii=False),
                    "ready",
                    "unassigned",
                    "Draft",
                    json.dumps(default_trust_gate_result(dataset_id), ensure_ascii=False),
                    None,
                    created_at,
                ),
            )
        return self.get_catalog_dataset(dataset_id)  # type: ignore[return-value]

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


def ensure_column(connection: sqlite3.Connection, table: str, column: str, definition: str) -> None:
    columns = [row["name"] for row in connection.execute(f"PRAGMA table_info({table})").fetchall()]
    if column not in columns:
        connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def default_trust_gate_result(dataset_id: str) -> dict[str, object]:
    failed_gates = ["quality", "pii", "owner", "policy", "approval"]
    return {
        "id": f"trust_gate_{uuid.uuid4().hex[:12]}",
        "dataset_id": dataset_id,
        "status": "Draft",
        "required_gates": ["schema", "quality", "pii", "owner", "policy", "approval"],
        "passed_gates": ["schema"],
        "failed_gates": failed_gates,
        "reasons": [f"{gate} gate is pending" for gate in failed_gates],
        "evaluated_at": now_iso(),
    }


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
        owner=row["owner"],
        trust_status=row["trust_status"],
        trust_gate_result=json.loads(row["trust_gate_result_json"]) if row["trust_gate_result_json"] else None,
        error_message=row["error_message"],
        created_at=row["created_at"],
    )


def source_dataset_from_row(row: sqlite3.Row) -> SourceDatasetRecord:
    return SourceDatasetRecord(
        id=row["id"],
        connection_id=row["connection_id"],
        connection_name=row["connection_name"],
        connection_type=row["connection_type"],
        name=row["name"],
        raw_scope=row["raw_scope"],
        resource_label=row["resource_label"],
        schema_preview=[ColumnSchema(**item) for item in json.loads(row["schema_preview_json"])],
        layer=row["layer"],
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def target_dataset_from_row(row: sqlite3.Row) -> TargetDatasetRecord:
    return TargetDatasetRecord(
        id=row["id"],
        name=row["name"],
        description=row["description"],
        source_dataset_id=row["source_dataset_id"],
        source_dataset_name=row["source_dataset_name"],
        source_type=row["source_type"],
        selected_fields=json.loads(row["selected_fields_json"]),
        process_rule=json.loads(row["process_rule_json"]),
        schedule=json.loads(row["schedule_json"]),
        output_schema=[ColumnSchema(**item) for item in json.loads(row["output_schema_json"])],
        job_definition=json.loads(row["job_definition_json"]),
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def target_dataset_run_from_row(row: sqlite3.Row) -> TargetDatasetRunRecord:
    return TargetDatasetRunRecord(
        id=row["id"],
        target_dataset_id=row["target_dataset_id"],
        target_dataset_name=row["target_dataset_name"],
        week2_run_id=row["week2_run_id"],
        pipeline_id=row["pipeline_id"],
        executor=row["executor"],
        status=row["status"],
        job_definition=json.loads(row["job_definition_json"]),
        execution_result=json.loads(row["execution_result_json"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def pipeline_from_row(row: sqlite3.Row) -> PipelineRecord:
    return PipelineRecord(
        id=row["id"],
        name=row["name"],
        source_dataset_id=row["source_dataset_id"],
        select_fields=json.loads(row["select_fields_json"]),
        target_name=row["target_name"],
        created_at=row["created_at"],
    )


def pipeline_run_from_row(row: sqlite3.Row) -> PipelineRunRecord:
    return PipelineRunRecord(
        id=row["id"],
        pipeline_id=row["pipeline_id"],
        status=row["status"],
        result_dataset_id=row["result_dataset_id"],
        result_location=row["result_location"],
        row_count=row["row_count"],
        error_message=row["error_message"],
        logs=json.loads(row["logs_json"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )
