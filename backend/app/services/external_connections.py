import csv
import os
import socket
import struct
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


class KafkaMetadataProtocolError(ExternalConnectionError):
    pass


def inspect_external_connection(
    connection: ExternalConnectionRecord,
    postgres_schema_inspector: "PostgresSchemaInspector | None" = None,
) -> ExternalTableSchema:
    if connection.connection_type == "postgres":
        inspector = postgres_schema_inspector or PostgresSchemaInspector()
        return inspector.inspect_table(connection, connection.default_schema, connection.default_table)
    if connection.connection_type == "kafka":
        return inspect_kafka_topic(connection)
    if connection.connection_type == "csv":
        return inspect_csv_path(connection)
    return inspect_draft_connection(connection)


def inspect_kafka_topic(connection: ExternalConnectionRecord) -> ExternalTableSchema:
    verify_kafka_topic_exists(connection)

    schema_preview = (
        read_csv_schema_preview(connection.database)
        if connection.database and os.path.exists(connection.database)
        else default_kafka_replay_schema()
    )

    return ExternalTableSchema(
        connection_id=connection.id,
        schema_name="kafka",
        table_name=connection.default_table,
        raw_scope=connection.default_table,
        resource_label="topic",
        schema_preview=schema_preview,
        row_count_estimate=None,
    )


def verify_kafka_topic_exists(connection: ExternalConnectionRecord) -> None:
    topic = connection.default_table
    try:
        with socket.create_connection((connection.host, connection.port), timeout=5) as kafka_socket:
            kafka_socket.settimeout(5)
            kafka_socket.sendall(build_kafka_metadata_request(topic))
            response_size = struct.unpack(">i", receive_exact(kafka_socket, 4))[0]
            response = receive_exact(kafka_socket, response_size)
            error_code = parse_kafka_metadata_topic_error(response, topic)
    except OSError as error:
        raise ExternalConnectionError(
            f"Kafka bootstrap server is not reachable: {connection.host}:{connection.port}"
        ) from error
    except (struct.error, KafkaMetadataProtocolError) as error:
        raise ExternalConnectionError(f"Kafka metadata check failed: {error}") from error

    if error_code == 3:
        raise ExternalTableNotFoundError(f"Kafka topic not found: {topic}")
    if error_code != 0:
        raise ExternalConnectionError(f"Kafka topic metadata returned error {error_code}: {topic}")


def build_kafka_metadata_request(topic: str) -> bytes:
    correlation_id = 1
    client_id = "asklake-test-connection"
    request = b"".join(
        [
            struct.pack(">hhih", 3, 4, correlation_id, len(client_id)),
            client_id.encode("utf-8"),
            struct.pack(">i", 1),
            write_kafka_string(topic),
            b"\x00",
        ]
    )
    return struct.pack(">i", len(request)) + request


def write_kafka_string(value: str) -> bytes:
    encoded = value.encode("utf-8")
    return struct.pack(">h", len(encoded)) + encoded


def receive_exact(kafka_socket: socket.socket, size: int) -> bytes:
    chunks = []
    remaining = size
    while remaining > 0:
        chunk = kafka_socket.recv(remaining)
        if not chunk:
            raise KafkaMetadataProtocolError("Kafka broker closed the metadata response early")
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)


def parse_kafka_metadata_topic_error(response: bytes, topic: str) -> int:
    offset = 0
    _, offset = read_int32(response, offset)
    _, offset = read_int32(response, offset)
    broker_count, offset = read_int32(response, offset)
    for _ in range(broker_count):
        _, offset = read_int32(response, offset)
        _, offset = read_kafka_string(response, offset)
        _, offset = read_int32(response, offset)
        _, offset = read_kafka_string(response, offset)

    _, offset = read_kafka_string(response, offset)
    _, offset = read_int32(response, offset)
    topic_count, offset = read_int32(response, offset)
    for _ in range(topic_count):
        error_code, offset = read_int16(response, offset)
        topic_name, offset = read_kafka_string(response, offset)
        offset += 1
        if topic_name == topic:
            return error_code
        partition_count, offset = read_int32(response, offset)
        for _ in range(partition_count):
            _, offset = read_int16(response, offset)
            _, offset = read_int32(response, offset)
            _, offset = read_int32(response, offset)
            offset = skip_int32_array(response, offset)
            offset = skip_int32_array(response, offset)
            offset = skip_int32_array(response, offset)

    raise ExternalTableNotFoundError(f"Kafka topic not found: {topic}")


def read_int16(buffer: bytes, offset: int) -> tuple[int, int]:
    return struct.unpack_from(">h", buffer, offset)[0], offset + 2


def read_int32(buffer: bytes, offset: int) -> tuple[int, int]:
    return struct.unpack_from(">i", buffer, offset)[0], offset + 4


def read_kafka_string(buffer: bytes, offset: int) -> tuple[str, int]:
    size, offset = read_int16(buffer, offset)
    if size < 0:
        return "", offset
    end = offset + size
    if end > len(buffer):
        raise KafkaMetadataProtocolError("Kafka string field exceeded response size")
    return buffer[offset:end].decode("utf-8"), end


def skip_int32_array(buffer: bytes, offset: int) -> int:
    array_size, offset = read_int32(buffer, offset)
    next_offset = offset + max(0, array_size) * 4
    if next_offset > len(buffer):
        raise KafkaMetadataProtocolError("Kafka array field exceeded response size")
    return next_offset


def inspect_csv_path(connection: ExternalConnectionRecord) -> ExternalTableSchema:
    file_path = connection.default_table
    if not os.path.exists(file_path):
        raise ExternalTableNotFoundError(f"CSV file not found: {file_path}")
    schema_preview = read_csv_schema_preview(file_path)
    return ExternalTableSchema(
        connection_id=connection.id,
        schema_name="local_file",
        table_name=file_path,
        raw_scope=file_path,
        resource_label="file_path",
        schema_preview=schema_preview,
        row_count_estimate=None,
    )


def read_csv_schema_preview(file_path: str) -> list[ColumnSchema]:
    if not os.path.exists(file_path):
        raise ExternalTableNotFoundError(f"CSV file not found: {file_path}")

    with open(file_path, encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle)
        try:
            headers = next(reader)
        except StopIteration as error:
            raise ExternalTableNotFoundError(f"CSV file is empty: {file_path}") from error
        sample = next(reader, [])

    return [
        ColumnSchema(name=(header.strip() or f"col_{index + 1}"), type=infer_csv_type(sample[index] if index < len(sample) else ""))
        for index, header in enumerate(headers)
    ]


def infer_csv_type(value: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return "string"
    lowered = raw.lower()
    if lowered in {"true", "false"}:
        return "boolean"
    try:
        int(raw)
        return "integer"
    except ValueError:
        pass
    try:
        float(raw)
        return "decimal"
    except ValueError:
        pass
    if raw.endswith(" UTC") or "T" in raw:
        return "timestamp"
    return "string"


def default_kafka_replay_schema() -> list[ColumnSchema]:
    return [
        ColumnSchema(name="event_time", type="timestamp"),
        ColumnSchema(name="event_type", type="string"),
        ColumnSchema(name="product_id", type="integer"),
        ColumnSchema(name="category_id", type="integer"),
        ColumnSchema(name="category_code", type="string"),
        ColumnSchema(name="brand", type="string"),
        ColumnSchema(name="price", type="decimal"),
        ColumnSchema(name="user_id", type="integer"),
        ColumnSchema(name="user_session", type="string"),
        ColumnSchema(name="event_date", type="string"),
        ColumnSchema(name="source", type="string"),
        ColumnSchema(name="is_synthetic", type="boolean"),
        ColumnSchema(name="synthetic_join_key", type="string"),
    ]


def inspect_draft_connection(connection: ExternalConnectionRecord) -> ExternalTableSchema:
    resource_labels = {
        "mongodb": "collection",
        "api": "endpoint",
        "s3": "bucket_prefix",
    }
    return ExternalTableSchema(
        connection_id=connection.id,
        schema_name=connection.connection_type,
        table_name=connection.default_table,
        raw_scope=connection.default_table,
        resource_label=resource_labels.get(connection.connection_type, "schema_table"),
        schema_preview=[ColumnSchema(name="raw_payload", type=connection.connection_type)],
        row_count_estimate=None,
    )


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
