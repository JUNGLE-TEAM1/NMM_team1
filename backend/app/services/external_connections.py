import os
from typing import Any

from app.domain.schemas import ColumnSchema, ExternalConnectionRecord, ExternalTableSchema

try:
    import psycopg
except ImportError:  # pragma: no cover - exercised when optional dependency is absent.
    psycopg = None


class ExternalConnectionError(ValueError):
    pass


class ExternalConnectionDependencyError(ExternalConnectionError):
    pass


class ExternalConnectionSecretError(ExternalConnectionError):
    pass


class ExternalTableNotFoundError(ExternalConnectionError):
    pass


class PostgresSchemaInspector:
    """Read-only PostgreSQL metadata inspector for Source Dataset registration."""

    def inspect_table(
        self,
        connection: ExternalConnectionRecord,
        schema_name: str,
        table_name: str,
    ) -> ExternalTableSchema:
        if psycopg is None:
            raise ExternalConnectionDependencyError("psycopg is required for PostgreSQL schema discovery")

        password = os.environ.get(connection.password_secret_ref)
        if not password:
            raise ExternalConnectionSecretError(f"Missing password env: {connection.password_secret_ref}")

        try:
            with psycopg.connect(
                host=connection.host,
                port=connection.port,
                dbname=connection.database,
                user=connection.username,
                password=password,
                connect_timeout=5,
            ) as postgres_connection:
                columns = read_columns(postgres_connection, schema_name, table_name)
                if not columns:
                    raise ExternalTableNotFoundError(f"PostgreSQL table not found: {schema_name}.{table_name}")
                row_count_estimate = read_row_count_estimate(postgres_connection, schema_name, table_name)
        except ExternalConnectionError:
            raise
        except Exception as error:
            raise ExternalConnectionError(f"PostgreSQL schema discovery failed: {error}") from error

        return ExternalTableSchema(
            connection_id=connection.id,
            schema_name=schema_name,
            table_name=table_name,
            raw_scope=f"{schema_name}.{table_name}",
            schema_preview=columns,
            row_count_estimate=row_count_estimate,
        )


def read_columns(postgres_connection: Any, schema_name: str, table_name: str) -> list[ColumnSchema]:
    with postgres_connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = %s
              AND table_name = %s
            ORDER BY ordinal_position
            """,
            (schema_name, table_name),
        )
        return [ColumnSchema(name=name, type=data_type) for name, data_type in cursor.fetchall()]


def read_row_count_estimate(postgres_connection: Any, schema_name: str, table_name: str) -> int | None:
    with postgres_connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT c.reltuples::bigint
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = %s
              AND c.relname = %s
            """,
            (schema_name, table_name),
        )
        row = cursor.fetchone()
    if not row:
        return None
    estimate = row[0]
    return int(estimate) if estimate is not None and int(estimate) >= 0 else None
