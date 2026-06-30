import json
import os
import sqlite3
import uuid
from datetime import date, datetime, timezone
from pathlib import Path

import pyarrow.parquet as pq

from app.domain.schemas import (
    CatalogDataset,
    ColumnSchema,
    ExternalConnectionCreate,
    ExternalConnectionRecord,
    ExternalConnectionUpdate,
    PipelineCreate,
    PipelineRecord,
    PipelineRunRecord,
    SilverDatasetCreate,
    SilverDatasetMaterializationRecord,
    SilverDatasetRecord,
    SilverDatasetUpdate,
    SourceCreate,
    SourceDatasetCreate,
    SourceDatasetRecord,
    SourceDatasetSnapshotRecord,
    SourceDatasetUpdate,
    SourceRecord,
    TargetDatasetDraftCreate,
    TargetDatasetDraftRecord,
    TargetDatasetDraftUpdate,
    TargetDatasetJobRunCreate,
    TargetDatasetJobRunRecord,
    TargetDatasetSchedule,
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
                    lineage_json TEXT,
                    metrics_json TEXT,
                    storage_json TEXT,
                    runtime_evidence_json TEXT,
                    source_evidence_json TEXT NOT NULL DEFAULT '[]',
                    error_message TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(source_id) REFERENCES sources(id)
                );

                CREATE TABLE IF NOT EXISTS external_connections (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    connector_type TEXT NOT NULL,
                    resource TEXT NOT NULL,
                    resource_label TEXT NOT NULL,
                    auth_mode TEXT NOT NULL,
                    mode_label TEXT NOT NULL,
                    contract_hint TEXT NOT NULL,
                    detected_format TEXT,
                    detected_dataset TEXT,
                    confidence TEXT,
                    recommended_role TEXT,
                    sync_mode TEXT NOT NULL DEFAULT 'manual',
                    sync_schedule TEXT NOT NULL DEFAULT 'manual on demand',
                    schema_preview_json TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
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

                CREATE TABLE IF NOT EXISTS source_dataset_snapshots (
                    id TEXT PRIMARY KEY,
                    source_dataset_id TEXT NOT NULL,
                    source_dataset_name TEXT NOT NULL,
                    connection_id TEXT NOT NULL,
                    connection_type TEXT NOT NULL,
                    input_scope TEXT NOT NULL,
                    output_path TEXT NOT NULL,
                    row_count INTEGER NOT NULL,
                    output_bytes INTEGER NOT NULL,
                    input_bytes INTEGER,
                    status TEXT NOT NULL,
                    duration_ms INTEGER NOT NULL,
                    message TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(source_dataset_id) REFERENCES source_datasets(id)
                );

                CREATE TABLE IF NOT EXISTS silver_datasets (
                    id TEXT PRIMARY KEY,
                    source_dataset_id TEXT NOT NULL,
                    source_dataset_name TEXT NOT NULL,
                    name TEXT NOT NULL UNIQUE,
                    purpose TEXT NOT NULL,
                    standardize_rules_json TEXT NOT NULL,
                    validation_rules_json TEXT NOT NULL,
                    schedule_json TEXT NOT NULL,
                    schema_preview_json TEXT NOT NULL,
                    layer TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS silver_dataset_materializations (
                    id TEXT PRIMARY KEY,
                    silver_dataset_id TEXT NOT NULL,
                    silver_dataset_name TEXT NOT NULL,
                    source_dataset_id TEXT NOT NULL,
                    source_dataset_name TEXT NOT NULL,
                    input_path TEXT NOT NULL,
                    output_path TEXT NOT NULL,
                    row_count INTEGER NOT NULL,
                    output_bytes INTEGER NOT NULL,
                    failed_row_count INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    duration_ms INTEGER NOT NULL,
                    message TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(silver_dataset_id) REFERENCES silver_datasets(id)
                );

                CREATE TABLE IF NOT EXISTS target_dataset_drafts (
                    id TEXT PRIMARY KEY,
                    target_dataset_name TEXT NOT NULL UNIQUE,
                    description TEXT NOT NULL,
                    base_source_ref_json TEXT NOT NULL,
                    target_grain TEXT NOT NULL,
                    source_refs_json TEXT NOT NULL,
                    silver_outputs_json TEXT NOT NULL,
                    processing_recipes_json TEXT NOT NULL,
                    gold_output TEXT NOT NULL,
                    executor_handoff TEXT NOT NULL,
                    schedule_json TEXT NOT NULL,
                    schema_preview_json TEXT NOT NULL,
                    layer TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS target_dataset_job_runs (
                    id TEXT PRIMARY KEY,
                    target_dataset_draft_id TEXT NOT NULL,
                    target_dataset_name TEXT NOT NULL,
                    gold_output TEXT NOT NULL,
                    job_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    executor_handoff TEXT NOT NULL,
                    schedule_json TEXT NOT NULL,
                    source_count INTEGER NOT NULL,
                    silver_output_count INTEGER NOT NULL,
                    processing_recipes_json TEXT NOT NULL,
                    triggered_by TEXT NOT NULL,
                    run_note TEXT NOT NULL,
                    output_path TEXT,
                    row_count INTEGER,
                    output_bytes INTEGER,
                    silver_output_paths_json TEXT NOT NULL DEFAULT '[]',
                    logs_json TEXT NOT NULL DEFAULT '[]',
                    duration_ms INTEGER,
                    source_evidence_json TEXT NOT NULL DEFAULT '[]',
                    runtime_evidence_json TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(target_dataset_draft_id) REFERENCES target_dataset_drafts(id)
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
            ensure_column(connection, "catalog_datasets", "lineage_json", "TEXT")
            ensure_column(connection, "catalog_datasets", "metrics_json", "TEXT")
            ensure_column(connection, "catalog_datasets", "storage_json", "TEXT")
            ensure_column(connection, "catalog_datasets", "runtime_evidence_json", "TEXT")
            ensure_column(connection, "catalog_datasets", "source_evidence_json", "TEXT NOT NULL DEFAULT '[]'")
            ensure_column(connection, "external_connections", "sync_mode", "TEXT NOT NULL DEFAULT 'manual'")
            ensure_column(connection, "external_connections", "sync_schedule", "TEXT NOT NULL DEFAULT 'manual on demand'")
            ensure_column(connection, "silver_datasets", "schedule_json", "TEXT NOT NULL DEFAULT '{\"mode\":\"manual\",\"note\":\"\"}'")
            ensure_column(connection, "target_dataset_job_runs", "output_path", "TEXT")
            ensure_column(connection, "target_dataset_job_runs", "row_count", "INTEGER")
            ensure_column(connection, "target_dataset_job_runs", "output_bytes", "INTEGER")
            ensure_column(connection, "target_dataset_job_runs", "silver_output_paths_json", "TEXT NOT NULL DEFAULT '[]'")
            ensure_column(connection, "target_dataset_job_runs", "logs_json", "TEXT NOT NULL DEFAULT '[]'")
            ensure_column(connection, "target_dataset_job_runs", "duration_ms", "INTEGER")
            ensure_column(connection, "target_dataset_job_runs", "source_evidence_json", "TEXT NOT NULL DEFAULT '[]'")
            ensure_column(connection, "target_dataset_job_runs", "runtime_evidence_json", "TEXT NOT NULL DEFAULT '{}'")

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

    def create_external_connection(self, connection_payload: ExternalConnectionCreate) -> ExternalConnectionRecord:
        connection_id = str(uuid.uuid4())
        created_at = now_iso()
        schema_preview = json.dumps(
            [column.model_dump() for column in connection_payload.schema_preview],
            ensure_ascii=False,
        )

        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO external_connections (
                    id, name, connector_type, resource, resource_label, auth_mode, mode_label,
                    contract_hint, detected_format, detected_dataset, confidence, recommended_role,
                    sync_mode, sync_schedule, schema_preview_json, status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    connection_id,
                    connection_payload.name,
                    connection_payload.connector_type,
                    connection_payload.resource,
                    connection_payload.resource_label,
                    connection_payload.auth_mode,
                    connection_payload.mode_label,
                    connection_payload.contract_hint,
                    connection_payload.detected_format,
                    connection_payload.detected_dataset,
                    connection_payload.confidence,
                    connection_payload.recommended_role,
                    connection_payload.sync_mode,
                    connection_payload.sync_schedule,
                    schema_preview,
                    "metadata_ready",
                    created_at,
                    created_at,
                ),
            )

        return self.get_external_connection(connection_id)  # type: ignore[return-value]

    def list_external_connections(self) -> list[ExternalConnectionRecord]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM external_connections ORDER BY created_at DESC").fetchall()
        return [external_connection_from_row(row) for row in rows]

    def get_external_connection(self, connection_id: str) -> ExternalConnectionRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM external_connections WHERE id = ?", (connection_id,)).fetchone()
        return external_connection_from_row(row) if row else None

    def update_external_connection(
        self,
        connection_id: str,
        connection_payload: ExternalConnectionUpdate,
    ) -> ExternalConnectionRecord | None:
        existing = self.get_external_connection(connection_id)
        if existing is None:
            return None

        updates = connection_payload.model_dump(exclude_unset=True)
        if not updates:
            return existing

        if "schema_preview" in updates and updates["schema_preview"] is not None:
            schema_preview = updates.pop("schema_preview")
            updates["schema_preview_json"] = json.dumps(
                [column.model_dump() if hasattr(column, "model_dump") else column for column in schema_preview],
                ensure_ascii=False,
            )

        allowed_columns = {
            "name",
            "resource",
            "resource_label",
            "auth_mode",
            "mode_label",
            "contract_hint",
            "detected_format",
            "detected_dataset",
            "confidence",
            "recommended_role",
            "sync_mode",
            "sync_schedule",
            "schema_preview_json",
        }
        columns: list[str] = []
        values: list[object] = []
        for column, value in updates.items():
            if column in allowed_columns and value is not None:
                columns.append(f"{column} = ?")
                values.append(value)

        if not columns:
            return existing

        updated_at = now_iso()
        columns.append("updated_at = ?")
        values.extend([updated_at, connection_id])

        with self.connect() as connection:
            connection.execute(
                f"UPDATE external_connections SET {', '.join(columns)} WHERE id = ?",
                values,
            )

        return self.get_external_connection(connection_id)

    def delete_external_connection(self, connection_id: str) -> bool:
        with self.connect() as connection:
            reference = connection.execute(
                "SELECT id FROM source_datasets WHERE connection_id = ? LIMIT 1",
                (connection_id,),
            ).fetchone()
            if reference is not None:
                raise ValueError("External connection is referenced by a Source Dataset")
            cursor = connection.execute("DELETE FROM external_connections WHERE id = ?", (connection_id,))
            return cursor.rowcount > 0

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

    def update_source_dataset(self, dataset_id: str, dataset: SourceDatasetUpdate) -> SourceDatasetRecord | None:
        existing = self.get_source_dataset(dataset_id)
        if existing is None:
            return None

        updates = dataset.model_dump(exclude_unset=True)
        if not updates:
            return existing

        columns: list[str] = []
        values: list[object] = []
        if "schema_preview" in updates and updates["schema_preview"] is not None:
            schema_preview = updates.pop("schema_preview")
            updates["schema_preview_json"] = json.dumps(
                [column.model_dump() if hasattr(column, "model_dump") else column for column in schema_preview],
                ensure_ascii=False,
            )

        allowed_columns = {"name", "raw_scope", "resource_label", "schema_preview_json", "status"}
        for column, value in updates.items():
            if column in allowed_columns and value is not None:
                columns.append(f"{column} = ?")
                values.append(value)

        if not columns:
            return existing

        updated_at = now_iso()
        columns.append("updated_at = ?")
        values.append(updated_at)
        values.append(dataset_id)

        with self.connect() as connection:
            connection.execute(
                f"UPDATE source_datasets SET {', '.join(columns)} WHERE id = ?",
                values,
            )

        return self.get_source_dataset(dataset_id)

    def delete_source_dataset(self, dataset_id: str) -> bool:
        with self.connect() as connection:
            reference = connection.execute(
                "SELECT id FROM silver_datasets WHERE source_dataset_id = ? LIMIT 1",
                (dataset_id,),
            ).fetchone()
            if reference is not None:
                raise ValueError("Source dataset is referenced by a Silver Dataset")
            cursor = connection.execute("DELETE FROM source_datasets WHERE id = ?", (dataset_id,))
            return cursor.rowcount > 0

    def create_source_dataset_snapshot(self, snapshot: SourceDatasetSnapshotRecord) -> SourceDatasetSnapshotRecord:
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO source_dataset_snapshots (
                    id, source_dataset_id, source_dataset_name, connection_id, connection_type,
                    input_scope, output_path, row_count, output_bytes, input_bytes, status,
                    duration_ms, message, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    snapshot.id,
                    snapshot.source_dataset_id,
                    snapshot.source_dataset_name,
                    snapshot.connection_id,
                    snapshot.connection_type,
                    snapshot.input_scope,
                    snapshot.output_path,
                    snapshot.row_count,
                    snapshot.output_bytes,
                    snapshot.input_bytes,
                    snapshot.status,
                    snapshot.duration_ms,
                    snapshot.message,
                    snapshot.created_at,
                ),
            )
        return snapshot

    def list_source_dataset_snapshots(self, dataset_id: str) -> list[SourceDatasetSnapshotRecord]:
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM source_dataset_snapshots WHERE source_dataset_id = ? ORDER BY created_at DESC",
                (dataset_id,),
            ).fetchall()
        return [source_dataset_snapshot_from_row(row) for row in rows]

    def create_silver_dataset(self, dataset: SilverDatasetCreate) -> SilverDatasetRecord:
        dataset_id = str(uuid.uuid4())
        created_at = now_iso()
        schema_preview = json.dumps(
            [column.model_dump() for column in dataset.schema_preview],
            ensure_ascii=False,
        )

        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO silver_datasets (
                    id, source_dataset_id, source_dataset_name, name, purpose,
                    standardize_rules_json, validation_rules_json, schedule_json, schema_preview_json,
                    layer, status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    dataset_id,
                    dataset.source_dataset_id,
                    dataset.source_dataset_name,
                    dataset.name,
                    dataset.purpose,
                    json.dumps(dataset.standardize_rules, ensure_ascii=False),
                    json.dumps(dataset.validation_rules, ensure_ascii=False),
                    json.dumps(dataset.schedule.model_dump(), ensure_ascii=False),
                    schema_preview,
                    "silver",
                    "metadata_ready",
                    created_at,
                    created_at,
                ),
            )

        return self.get_silver_dataset(dataset_id)  # type: ignore[return-value]

    def list_silver_datasets(self) -> list[SilverDatasetRecord]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM silver_datasets ORDER BY created_at DESC").fetchall()
        return [silver_dataset_from_row(row) for row in rows]

    def get_silver_dataset(self, dataset_id: str) -> SilverDatasetRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM silver_datasets WHERE id = ?", (dataset_id,)).fetchone()
        return silver_dataset_from_row(row) if row else None

    def update_silver_dataset_schedule(
        self,
        dataset_id: str,
        schedule: TargetDatasetSchedule,
    ) -> SilverDatasetRecord | None:
        if self.get_silver_dataset(dataset_id) is None:
            return None

        updated_at = now_iso()
        with self.connect() as connection:
            connection.execute(
                "UPDATE silver_datasets SET schedule_json = ?, updated_at = ? WHERE id = ?",
                (json.dumps(schedule.model_dump(), ensure_ascii=False), updated_at, dataset_id),
            )

        return self.get_silver_dataset(dataset_id)

    def update_silver_dataset(self, dataset_id: str, dataset: SilverDatasetUpdate) -> SilverDatasetRecord | None:
        existing = self.get_silver_dataset(dataset_id)
        if existing is None:
            return None

        updates = dataset.model_dump(exclude_unset=True)
        if not updates:
            return existing

        requested_name = updates.get("name")
        if requested_name is not None and requested_name != existing.name and self.target_draft_references_silver_dataset(dataset_id):
            raise ValueError("Silver dataset name is referenced by a Target Dataset draft")

        json_fields = {
            "standardize_rules": "standardize_rules_json",
            "validation_rules": "validation_rules_json",
            "schema_preview": "schema_preview_json",
        }
        for field, column_name in json_fields.items():
            if field not in updates or updates[field] is None:
                continue
            value = updates.pop(field)
            if field == "schema_preview":
                updates[column_name] = json.dumps(
                    [column.model_dump() if hasattr(column, "model_dump") else column for column in value],
                    ensure_ascii=False,
                )
            else:
                updates[column_name] = json.dumps(value, ensure_ascii=False)

        allowed_columns = {
            "name",
            "purpose",
            "standardize_rules_json",
            "validation_rules_json",
            "schema_preview_json",
            "status",
        }
        columns: list[str] = []
        values: list[object] = []
        for column, value in updates.items():
            if column in allowed_columns and value is not None:
                columns.append(f"{column} = ?")
                values.append(value)

        if not columns:
            return existing

        updated_at = now_iso()
        columns.append("updated_at = ?")
        values.extend([updated_at, dataset_id])

        with self.connect() as connection:
            connection.execute(
                f"UPDATE silver_datasets SET {', '.join(columns)} WHERE id = ?",
                values,
            )

        return self.get_silver_dataset(dataset_id)

    def delete_silver_dataset(self, dataset_id: str) -> bool:
        if self.get_silver_dataset(dataset_id) is None:
            return False

        if self.target_draft_references_silver_dataset(dataset_id):
            raise ValueError("Silver dataset is referenced by a Target Dataset draft")

        with self.connect() as connection:
            cursor = connection.execute("DELETE FROM silver_datasets WHERE id = ?", (dataset_id,))
            return cursor.rowcount > 0

    def create_silver_dataset_materialization(
        self,
        materialization: SilverDatasetMaterializationRecord,
    ) -> SilverDatasetMaterializationRecord:
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO silver_dataset_materializations (
                    id, silver_dataset_id, silver_dataset_name, source_dataset_id, source_dataset_name,
                    input_path, output_path, row_count, output_bytes, failed_row_count,
                    status, duration_ms, message, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    materialization.id,
                    materialization.silver_dataset_id,
                    materialization.silver_dataset_name,
                    materialization.source_dataset_id,
                    materialization.source_dataset_name,
                    materialization.input_path,
                    materialization.output_path,
                    materialization.row_count,
                    materialization.output_bytes,
                    materialization.failed_row_count,
                    materialization.status,
                    materialization.duration_ms,
                    materialization.message,
                    materialization.created_at,
                ),
            )
        return materialization

    def list_silver_dataset_materializations(self, dataset_id: str) -> list[SilverDatasetMaterializationRecord]:
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM silver_dataset_materializations WHERE silver_dataset_id = ? ORDER BY created_at DESC",
                (dataset_id,),
            ).fetchall()
        return [silver_dataset_materialization_from_row(row) for row in rows]

    def target_draft_references_silver_dataset(self, dataset_id: str) -> bool:
        for draft in self.list_target_dataset_drafts():
            if draft.base_source_ref.source_id == dataset_id:
                return True
            if any(source_ref.source_id == dataset_id for source_ref in draft.source_refs):
                return True
        return False

    def create_target_dataset_draft(self, draft: TargetDatasetDraftCreate) -> TargetDatasetDraftRecord:
        draft_id = str(uuid.uuid4())
        created_at = now_iso()

        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO target_dataset_drafts (
                    id, target_dataset_name, description, base_source_ref_json, target_grain,
                    source_refs_json, silver_outputs_json, processing_recipes_json, gold_output,
                    executor_handoff, schedule_json, schema_preview_json, layer, status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    draft_id,
                    draft.target_dataset_name,
                    draft.description,
                    json.dumps(draft.base_source_ref.model_dump(), ensure_ascii=False),
                    draft.target_grain,
                    json.dumps([source_ref.model_dump() for source_ref in draft.source_refs], ensure_ascii=False),
                    json.dumps([silver_output.model_dump() for silver_output in draft.silver_outputs], ensure_ascii=False),
                    json.dumps(draft.processing_recipes, ensure_ascii=False),
                    draft.gold_output,
                    draft.executor_handoff,
                    json.dumps(draft.schedule.model_dump(), ensure_ascii=False),
                    json.dumps([column.model_dump() for column in draft.schema_preview], ensure_ascii=False),
                    "target",
                    "draft_ready",
                    created_at,
                    created_at,
                ),
            )

        return self.get_target_dataset_draft(draft_id)  # type: ignore[return-value]

    def list_target_dataset_drafts(self) -> list[TargetDatasetDraftRecord]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM target_dataset_drafts ORDER BY created_at DESC").fetchall()
        return [target_dataset_draft_from_row(row) for row in rows]

    def get_target_dataset_draft(self, draft_id: str) -> TargetDatasetDraftRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM target_dataset_drafts WHERE id = ?", (draft_id,)).fetchone()
        return target_dataset_draft_from_row(row) if row else None

    def update_target_dataset_draft_schedule(
        self,
        draft_id: str,
        schedule: TargetDatasetSchedule,
    ) -> TargetDatasetDraftRecord | None:
        if self.get_target_dataset_draft(draft_id) is None:
            return None

        updated_at = now_iso()
        with self.connect() as connection:
            connection.execute(
                "UPDATE target_dataset_drafts SET schedule_json = ?, updated_at = ? WHERE id = ?",
                (json.dumps(schedule.model_dump(), ensure_ascii=False), updated_at, draft_id),
            )

        return self.get_target_dataset_draft(draft_id)

    def update_target_dataset_draft(
        self,
        draft_id: str,
        draft: TargetDatasetDraftUpdate,
    ) -> TargetDatasetDraftRecord | None:
        existing = self.get_target_dataset_draft(draft_id)
        if existing is None:
            return None

        updates = draft.model_dump(exclude_unset=True)
        if not updates:
            return existing

        json_fields = {
            "base_source_ref": "base_source_ref_json",
            "source_refs": "source_refs_json",
            "silver_outputs": "silver_outputs_json",
            "processing_recipes": "processing_recipes_json",
            "schema_preview": "schema_preview_json",
        }
        for field, column_name in json_fields.items():
            if field not in updates or updates[field] is None:
                continue
            value = updates.pop(field)
            if isinstance(value, list):
                updates[column_name] = json.dumps(
                    [item.model_dump() if hasattr(item, "model_dump") else item for item in value],
                    ensure_ascii=False,
                )
            else:
                updates[column_name] = json.dumps(
                    value.model_dump() if hasattr(value, "model_dump") else value,
                    ensure_ascii=False,
                )

        allowed_columns = {
            "target_dataset_name",
            "description",
            "base_source_ref_json",
            "target_grain",
            "source_refs_json",
            "silver_outputs_json",
            "processing_recipes_json",
            "gold_output",
            "executor_handoff",
            "schema_preview_json",
            "status",
        }
        columns: list[str] = []
        values: list[object] = []
        for column, value in updates.items():
            if column in allowed_columns and value is not None:
                columns.append(f"{column} = ?")
                values.append(value)

        if not columns:
            return existing

        updated_at = now_iso()
        columns.append("updated_at = ?")
        values.extend([updated_at, draft_id])

        with self.connect() as connection:
            connection.execute(
                f"UPDATE target_dataset_drafts SET {', '.join(columns)} WHERE id = ?",
                values,
            )

        return self.get_target_dataset_draft(draft_id)

    def delete_target_dataset_draft(self, draft_id: str) -> bool:
        with self.connect() as connection:
            reference = connection.execute(
                "SELECT id FROM target_dataset_job_runs WHERE target_dataset_draft_id = ? LIMIT 1",
                (draft_id,),
            ).fetchone()
            if reference is not None:
                raise ValueError("Target dataset draft is referenced by a Job Run")
            cursor = connection.execute("DELETE FROM target_dataset_drafts WHERE id = ?", (draft_id,))
            return cursor.rowcount > 0

    def create_target_dataset_job_run(
        self,
        draft: TargetDatasetDraftRecord,
        run: TargetDatasetJobRunCreate,
    ) -> TargetDatasetJobRunRecord:
        run_id = str(uuid.uuid4())
        created_at = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO target_dataset_job_runs (
                    id, target_dataset_draft_id, target_dataset_name, gold_output, job_type,
                    status, executor_handoff, schedule_json, source_count, silver_output_count,
                    processing_recipes_json, triggered_by, run_note, output_path, row_count,
                    output_bytes, silver_output_paths_json, logs_json, duration_ms,
                    source_evidence_json, runtime_evidence_json, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    run_id,
                    draft.id,
                    draft.target_dataset_name,
                    draft.gold_output,
                    run.job_type,
                    "queued",
                    draft.executor_handoff,
                    json.dumps(draft.schedule.model_dump(), ensure_ascii=False),
                    len(draft.source_refs),
                    len(draft.silver_outputs),
                    json.dumps(draft.processing_recipes, ensure_ascii=False),
                    run.triggered_by,
                    "Run handoff queued. Runner execution is not triggered in C-4.",
                    None,
                    None,
                    None,
                    "[]",
                    "[]",
                    None,
                    "[]",
                    "{}",
                    created_at,
                    created_at,
                ),
            )
        return self.get_target_dataset_job_run(run_id)  # type: ignore[return-value]

    def list_target_dataset_job_runs(self) -> list[TargetDatasetJobRunRecord]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM target_dataset_job_runs ORDER BY created_at DESC").fetchall()
        return [target_dataset_job_run_from_row(row) for row in rows]

    def get_target_dataset_job_run(self, run_id: str) -> TargetDatasetJobRunRecord | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM target_dataset_job_runs WHERE id = ?", (run_id,)).fetchone()
        return target_dataset_job_run_from_row(row) if row else None

    def update_target_dataset_job_run_materialization(
        self,
        run_id: str,
        status: str,
        run_note: str,
        output_path: str | None,
        row_count: int | None,
        output_bytes: int | None,
        silver_output_paths: list[str],
        logs: list[str],
        duration_ms: int | None = None,
        source_evidence: list[dict[str, object]] | None = None,
        runtime_evidence: dict[str, object] | None = None,
    ) -> TargetDatasetJobRunRecord:
        updated_at = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                UPDATE target_dataset_job_runs
                SET status = ?,
                    run_note = ?,
                    output_path = ?,
                    row_count = ?,
                    output_bytes = ?,
                    silver_output_paths_json = ?,
                    logs_json = ?,
                    duration_ms = ?,
                    source_evidence_json = ?,
                    runtime_evidence_json = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                (
                    status,
                    run_note,
                    output_path,
                    row_count,
                    output_bytes,
                    json.dumps(silver_output_paths, ensure_ascii=False),
                    json.dumps(logs, ensure_ascii=False),
                    duration_ms,
                    json.dumps(source_evidence or [], ensure_ascii=False),
                    json.dumps(runtime_evidence or {}, ensure_ascii=False),
                    updated_at,
                    run_id,
                ),
            )
        return self.get_target_dataset_job_run(run_id)  # type: ignore[return-value]

    def list_catalog_datasets(self) -> list[CatalogDataset]:
        with self.connect() as connection:
            rows = connection.execute("SELECT * FROM catalog_datasets ORDER BY created_at DESC").fetchall()
        return [dataset_from_row(row) for row in rows]

    def get_catalog_dataset(self, dataset_id: str) -> CatalogDataset | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM catalog_datasets WHERE id = ?", (dataset_id,)).fetchone()
        return dataset_from_row(row) if row else None

    def get_catalog_dataset_by_source_id(self, source_id: str) -> CatalogDataset | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM catalog_datasets WHERE source_id = ?", (source_id,)).fetchone()
        return dataset_from_row(row) if row else None

    def publish_target_dataset_job_run_to_catalog(
        self,
        run: TargetDatasetJobRunRecord,
        draft: TargetDatasetDraftRecord,
    ) -> CatalogDataset:
        existing_dataset = self.get_catalog_dataset_by_source_id(run.id)
        if existing_dataset is not None:
            return existing_dataset

        if run.status != "succeeded" or run.output_path is None or run.row_count is None:
            raise ValueError("Target dataset job run must be succeeded before catalog publish")

        dataset_id = str(uuid.uuid4())
        created_at = now_iso()
        output_path = Path(run.output_path)
        output_format = output_format_for_run(run, output_path)
        sample = read_dataset_sample(output_path, output_format, limit=5)
        catalog_columns = catalog_columns_for_run(draft, output_path, output_format)
        lineage = {
            "run_id": run.id,
            "target_dataset_draft_id": draft.id,
            "target_dataset_name": draft.target_dataset_name,
            "source_refs": [source_ref.model_dump() for source_ref in draft.source_refs],
            "silver_output_paths": run.silver_output_paths,
            "processing_recipes": run.processing_recipes,
        }
        metrics = {
            "row_count": run.row_count,
            "bytes": run.output_bytes,
            "duration_ms": run.duration_ms,
            "source_count": run.source_count,
            "silver_output_count": run.silver_output_count,
        }
        storage = {
            "local_path": run.output_path,
            "format": output_format,
        }

        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO catalog_datasets (
                    id, source_id, name, source_type, path, schema_json, row_count,
                    sample_json, status, owner, trust_status, trust_gate_result_json,
                    lineage_json, metrics_json, storage_json, runtime_evidence_json,
                    source_evidence_json, error_message, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    dataset_id,
                    run.id,
                    run.gold_output,
                    "target_dataset_job_run",
                    run.output_path,
                    json.dumps([column.model_dump() for column in catalog_columns], ensure_ascii=False),
                    run.row_count,
                    json.dumps(sample, ensure_ascii=False),
                    "ready",
                    "unassigned",
                    "Draft",
                    json.dumps(default_trust_gate_result(dataset_id), ensure_ascii=False),
                    json.dumps(lineage, ensure_ascii=False),
                    json.dumps(metrics, ensure_ascii=False),
                    json.dumps(storage, ensure_ascii=False),
                    json.dumps(run.runtime_evidence, ensure_ascii=False),
                    json.dumps(run.source_evidence, ensure_ascii=False),
                    None,
                    created_at,
                ),
            )
        return self.get_catalog_dataset(dataset_id)  # type: ignore[return-value]

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


def read_dataset_sample(path: Path, output_format: str, limit: int = 5) -> list[dict[str, object]]:
    if output_format == "parquet":
        return read_parquet_sample(path, limit=limit)
    return read_jsonl_sample(path, limit=limit)


def read_jsonl_sample(path: Path, limit: int = 5) -> list[dict[str, object]]:
    if limit <= 0 or not path.exists():
        return []

    rows: list[dict[str, object]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if len(rows) >= limit:
                break
            if not line.strip():
                continue
            rows.append(json.loads(line))
    return rows


def read_parquet_sample(path: Path, limit: int = 5) -> list[dict[str, object]]:
    if limit <= 0 or not path.exists():
        return []
    table = pq.read_table(path)
    return [json_safe_row(row) for row in table.slice(0, limit).to_pylist()]


def output_format_for_run(run: TargetDatasetJobRunRecord, path: Path) -> str:
    runtime_format = run.runtime_evidence.get("output_format")
    if isinstance(runtime_format, str) and runtime_format:
        return runtime_format
    if path.suffix.lower() == ".parquet":
        return "parquet"
    return "jsonl"


def catalog_columns_for_run(
    draft: TargetDatasetDraftRecord,
    path: Path,
    output_format: str,
) -> list[ColumnSchema]:
    if output_format == "parquet" and path.exists():
        return parquet_columns(path)
    return draft.schema_preview


def parquet_columns(path: Path) -> list[ColumnSchema]:
    schema = pq.ParquetFile(path).schema_arrow
    return [ColumnSchema(name=field.name, type=str(field.type)) for field in schema]


def json_safe_row(row: dict[str, object]) -> dict[str, object]:
    return {key: json_safe_value(value) for key, value in row.items()}


def json_safe_value(value: object) -> object:
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, dict):
        return {str(key): json_safe_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [json_safe_value(item) for item in value]
    return value


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
        lineage=json.loads(row["lineage_json"]) if row["lineage_json"] else None,
        metrics=json.loads(row["metrics_json"]) if row["metrics_json"] else None,
        storage=json.loads(row["storage_json"]) if row["storage_json"] else None,
        runtime_evidence=json.loads(row["runtime_evidence_json"]) if row["runtime_evidence_json"] else None,
        source_evidence=json.loads(row["source_evidence_json"]) if row["source_evidence_json"] else [],
        error_message=row["error_message"],
        created_at=row["created_at"],
    )


def external_connection_from_row(row: sqlite3.Row) -> ExternalConnectionRecord:
    return ExternalConnectionRecord(
        id=row["id"],
        name=row["name"],
        connector_type=row["connector_type"],
        resource=row["resource"],
        resource_label=row["resource_label"],
        auth_mode=row["auth_mode"],
        mode_label=row["mode_label"],
        contract_hint=row["contract_hint"],
        detected_format=row["detected_format"],
        detected_dataset=row["detected_dataset"],
        confidence=row["confidence"],
        recommended_role=row["recommended_role"],
        sync_mode=row["sync_mode"],
        sync_schedule=row["sync_schedule"],
        schema_preview=[ColumnSchema(**item) for item in json.loads(row["schema_preview_json"])],
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
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


def source_dataset_snapshot_from_row(row: sqlite3.Row) -> SourceDatasetSnapshotRecord:
    return SourceDatasetSnapshotRecord(
        id=row["id"],
        source_dataset_id=row["source_dataset_id"],
        source_dataset_name=row["source_dataset_name"],
        connection_id=row["connection_id"],
        connection_type=row["connection_type"],
        input_scope=row["input_scope"],
        output_path=row["output_path"],
        row_count=row["row_count"],
        output_bytes=row["output_bytes"],
        input_bytes=row["input_bytes"],
        status=row["status"],
        duration_ms=row["duration_ms"],
        message=row["message"],
        created_at=row["created_at"],
    )


def silver_dataset_from_row(row: sqlite3.Row) -> SilverDatasetRecord:
    return SilverDatasetRecord(
        id=row["id"],
        source_dataset_id=row["source_dataset_id"],
        source_dataset_name=row["source_dataset_name"],
        name=row["name"],
        purpose=row["purpose"],
        standardize_rules=json.loads(row["standardize_rules_json"]),
        validation_rules=json.loads(row["validation_rules_json"]),
        schedule=json.loads(row["schedule_json"]),
        schema_preview=[ColumnSchema(**item) for item in json.loads(row["schema_preview_json"])],
        layer=row["layer"],
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def silver_dataset_materialization_from_row(row: sqlite3.Row) -> SilverDatasetMaterializationRecord:
    return SilverDatasetMaterializationRecord(
        id=row["id"],
        silver_dataset_id=row["silver_dataset_id"],
        silver_dataset_name=row["silver_dataset_name"],
        source_dataset_id=row["source_dataset_id"],
        source_dataset_name=row["source_dataset_name"],
        input_path=row["input_path"],
        output_path=row["output_path"],
        row_count=row["row_count"],
        output_bytes=row["output_bytes"],
        failed_row_count=row["failed_row_count"],
        status=row["status"],
        duration_ms=row["duration_ms"],
        message=row["message"],
        created_at=row["created_at"],
    )


def target_dataset_draft_from_row(row: sqlite3.Row) -> TargetDatasetDraftRecord:
    return TargetDatasetDraftRecord(
        id=row["id"],
        target_dataset_name=row["target_dataset_name"],
        description=row["description"],
        base_source_ref=json.loads(row["base_source_ref_json"]),
        target_grain=row["target_grain"],
        source_refs=json.loads(row["source_refs_json"]),
        silver_outputs=json.loads(row["silver_outputs_json"]),
        processing_recipes=json.loads(row["processing_recipes_json"]),
        gold_output=row["gold_output"],
        executor_handoff=row["executor_handoff"],
        schedule=json.loads(row["schedule_json"]),
        schema_preview=[ColumnSchema(**item) for item in json.loads(row["schema_preview_json"])],
        layer=row["layer"],
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def target_dataset_job_run_from_row(row: sqlite3.Row) -> TargetDatasetJobRunRecord:
    return TargetDatasetJobRunRecord(
        id=row["id"],
        target_dataset_draft_id=row["target_dataset_draft_id"],
        target_dataset_name=row["target_dataset_name"],
        gold_output=row["gold_output"],
        job_type=row["job_type"],
        status=row["status"],
        executor_handoff=row["executor_handoff"],
        schedule=json.loads(row["schedule_json"]),
        source_count=row["source_count"],
        silver_output_count=row["silver_output_count"],
        processing_recipes=json.loads(row["processing_recipes_json"]),
        triggered_by=row["triggered_by"],
        run_note=row["run_note"],
        output_path=row["output_path"],
        row_count=row["row_count"],
        output_bytes=row["output_bytes"],
        silver_output_paths=json.loads(row["silver_output_paths_json"]),
        logs=json.loads(row["logs_json"]),
        duration_ms=row["duration_ms"],
        source_evidence=json.loads(row["source_evidence_json"]),
        runtime_evidence=json.loads(row["runtime_evidence_json"]),
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
