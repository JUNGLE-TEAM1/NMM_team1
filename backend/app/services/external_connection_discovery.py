import csv
import json
from collections import defaultdict
from io import BytesIO, StringIO
from pathlib import Path

import pyarrow.parquet as pq

from app.adapters.csv_source import infer_column_type
from app.domain.schemas import ColumnSchema, ExternalConnectionInspectRequest, ExternalConnectionInspectResult
from app.services.external_connection_runtime import (
    ExternalConnectionRuntimeCheckError,
    credential_from_env_ref,
    parse_host_resource,
    parse_s3_resource,
    validate_no_raw_secret_fields,
)

try:
    import boto3
except ImportError:  # pragma: no cover
    boto3 = None

try:
    import psycopg
except ImportError:  # pragma: no cover
    psycopg = None

try:
    import pymongo
except ImportError:  # pragma: no cover
    pymongo = None

try:
    from kafka import KafkaConsumer
except ImportError:  # pragma: no cover
    KafkaConsumer = None


class ExternalConnectionDiscoveryError(ValueError):
    pass


SUPPORTED_FILE_SUFFIXES = {".csv", ".jsonl", ".json", ".parquet"}


class ExternalConnectionDiscoveryService:
    supported_connector_types = {"local_file", "local_folder", "postgres", "mongodb", "s3", "object_storage", "kafka"}

    def inspect(self, request: ExternalConnectionInspectRequest) -> ExternalConnectionInspectResult:
        if request.connector_type not in self.supported_connector_types:
            raise ExternalConnectionDiscoveryError(
                f"{request.connector_type} connector는 lightweight discovery 대상이 아닙니다."
            )

        if request.connector_type == "postgres":
            return self._inspect_postgres(request)
        if request.connector_type == "mongodb":
            return self._inspect_mongodb(request)
        if request.connector_type in {"s3", "object_storage"}:
            return self._inspect_s3(request)
        if request.connector_type == "kafka":
            return self._inspect_kafka(request)

        path = resolve_local_path(request.resource)
        if request.connector_type == "local_file":
            if not path.is_file():
                raise ExternalConnectionDiscoveryError(f"Local file path가 아닙니다: {request.resource}")
            return self._inspect_file(path, request, file_count=1)

        if not path.is_dir():
            raise ExternalConnectionDiscoveryError(f"Local folder path가 아닙니다: {request.resource}")
        return self._inspect_folder(path, request)

    def _inspect_postgres(self, request: ExternalConnectionInspectRequest) -> ExternalConnectionInspectResult:
        if psycopg is None:
            raise ExternalConnectionDiscoveryError("psycopg runtime dependency가 설치되어 있지 않습니다.")
        validate_discovery_secret_refs(request)
        scope = required_scope(request, "PostgreSQL table scope는 예: public.connection_smoke 형식이어야 합니다.")
        schema_name, table_name = split_postgres_scope(scope)
        parsed = parse_host_resource(request.resource, default_port=5432)
        user = credential_from_env_ref(request.secret_refs, "username")
        password = credential_from_env_ref(request.secret_refs, "password")
        try:
            with psycopg.connect(
                host=parsed.host,
                port=parsed.port,
                dbname=parsed.database or request.options.get("database") or "postgres",
                user=user,
                password=password,
                connect_timeout=request.options.get("timeout_seconds", 3),
            ) as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        select column_name, data_type
                        from information_schema.columns
                        where table_schema = %s and table_name = %s
                        order by ordinal_position
                        """,
                        (schema_name, table_name),
                    )
                    schema = [ColumnSchema(name=name, type=column_type) for name, column_type in cursor.fetchall()]
                    if not schema:
                        raise ExternalConnectionDiscoveryError(f"PostgreSQL table schema를 찾지 못했습니다: {scope}")
                    quoted_schema = quote_sql_identifier(schema_name)
                    quoted_table = quote_sql_identifier(table_name)
                    cursor.execute(f"select * from {quoted_schema}.{quoted_table} limit %s", (request.sample_size,))
                    column_names = [description.name for description in cursor.description or []]
                    sample_rows = [dict(zip(column_names, row, strict=False)) for row in cursor.fetchall()]
                    cursor.execute("select reltuples::bigint from pg_class where oid = %s::regclass", (f"{schema_name}.{table_name}",))
                    row_count = cursor.fetchone()[0]
        except ExternalConnectionDiscoveryError:
            raise
        except Exception as error:
            raise ExternalConnectionDiscoveryError(f"PostgreSQL schema discovery failed: {error.__class__.__name__}") from error

        return ExternalConnectionInspectResult(
            connector_type=request.connector_type,
            resource=request.resource,
            resource_label=request.resource_label or "postgres_table",
            detected_format="PostgreSQL table",
            detected_dataset=scope,
            confidence="High",
            recommended_role="Source Dataset",
            schema_preview=schema,
            sample_rows=sample_rows,
            bytes=0,
            file_count=None,
            row_count=max(row_count, len(sample_rows)),
            row_count_status="metadata",
            message=f"{scope} table에서 {len(schema)}개 field를 확인했습니다.",
        )

    def _inspect_mongodb(self, request: ExternalConnectionInspectRequest) -> ExternalConnectionInspectResult:
        if pymongo is None:
            raise ExternalConnectionDiscoveryError("pymongo runtime dependency가 설치되어 있지 않습니다.")
        validate_discovery_secret_refs(request)
        scope = required_scope(request, "MongoDB collection scope는 예: asklake.connection_smoke 형식이어야 합니다.")
        database_name, collection_name = split_dot_scope(scope, "MongoDB collection")
        user = credential_from_env_ref(request.secret_refs, "username")
        password = credential_from_env_ref(request.secret_refs, "password")
        client = pymongo.MongoClient(
            request.resource,
            username=user,
            password=password,
            serverSelectionTimeoutMS=int(float(request.options.get("timeout_seconds", 3)) * 1000),
        )
        try:
            collection = client[database_name][collection_name]
            sample_rows = list(collection.find({}, {"_id": False}).limit(request.sample_size))
            if not sample_rows:
                raise ExternalConnectionDiscoveryError(f"MongoDB collection sample row가 없습니다: {scope}")
            schema = infer_schema_from_rows(sample_rows)
            row_count = collection.estimated_document_count()
        except ExternalConnectionDiscoveryError:
            raise
        except Exception as error:
            raise ExternalConnectionDiscoveryError(f"MongoDB schema discovery failed: {error.__class__.__name__}") from error
        finally:
            client.close()

        return ExternalConnectionInspectResult(
            connector_type=request.connector_type,
            resource=request.resource,
            resource_label=request.resource_label or "mongo_collection",
            detected_format="MongoDB collection",
            detected_dataset=scope,
            confidence="Medium",
            recommended_role="Source Dataset",
            schema_preview=schema,
            sample_rows=sample_rows,
            bytes=0,
            file_count=None,
            row_count=row_count,
            row_count_status="metadata",
            message=f"{scope} collection에서 {len(schema)}개 field를 확인했습니다.",
        )

    def _inspect_s3(self, request: ExternalConnectionInspectRequest) -> ExternalConnectionInspectResult:
        if boto3 is None:
            raise ExternalConnectionDiscoveryError("boto3 runtime dependency가 설치되어 있지 않습니다.")
        validate_discovery_secret_refs(request)
        parsed = parse_s3_resource(request.resource, request.options)
        object_key = request.options.get("scope", "").strip()
        access_key = credential_from_env_ref(request.secret_refs, "access_key")
        secret_key = credential_from_env_ref(request.secret_refs, "secret_key")
        client = boto3.client(
            "s3",
            endpoint_url=parsed.endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=request.options.get("region", "us-east-1"),
        )
        if not object_key:
            listing = client.list_objects_v2(Bucket=parsed.bucket, MaxKeys=20)
            candidates = [
                item["Key"]
                for item in listing.get("Contents", [])
                if Path(item["Key"]).suffix.lower() in SUPPORTED_FILE_SUFFIXES
            ]
            if not candidates:
                raise ExternalConnectionDiscoveryError("S3 bucket에서 CSV/JSON/JSONL/Parquet sample object를 찾지 못했습니다.")
            object_key = sorted(candidates)[0]
        try:
            payload = client.get_object(Bucket=parsed.bucket, Key=object_key)
            body = payload["Body"].read()
            schema, sample_rows, detected_format, row_count, row_count_status = inspect_bytes_object(
                object_key,
                body,
                request.sample_size,
            )
        except ExternalConnectionDiscoveryError:
            raise
        except Exception as error:
            raise ExternalConnectionDiscoveryError(f"S3 object schema discovery failed: {error.__class__.__name__}") from error

        return ExternalConnectionInspectResult(
            connector_type=request.connector_type,
            resource=request.resource,
            resource_label=request.resource_label or "s3_object",
            detected_format=f"S3 {detected_format}",
            detected_dataset=object_key,
            confidence="Medium",
            recommended_role="Source Dataset",
            schema_preview=schema,
            sample_rows=sample_rows,
            bytes=len(body),
            file_count=1,
            row_count=row_count,
            row_count_status=row_count_status,
            message=f"s3://{parsed.bucket}/{object_key} object에서 {len(schema)}개 field를 확인했습니다.",
        )

    def _inspect_kafka(self, request: ExternalConnectionInspectRequest) -> ExternalConnectionInspectResult:
        if KafkaConsumer is None:
            raise ExternalConnectionDiscoveryError("kafka-python runtime dependency가 설치되어 있지 않습니다.")
        topic = required_scope(request, "Kafka topic scope가 필요합니다.")
        try:
            consumer = KafkaConsumer(
                topic,
                bootstrap_servers=request.resource,
                auto_offset_reset="earliest",
                enable_auto_commit=False,
                consumer_timeout_ms=int(float(request.options.get("timeout_seconds", 5)) * 1000),
                group_id=request.options.get("group_id", "asklake-discovery"),
                value_deserializer=lambda value: json.loads(value.decode("utf-8")),
            )
            try:
                sample_rows = []
                for message in consumer:
                    if isinstance(message.value, dict):
                        sample_rows.append(message.value)
                    if len(sample_rows) >= request.sample_size:
                        break
            finally:
                consumer.close()
            if not sample_rows:
                raise ExternalConnectionDiscoveryError(f"Kafka topic sample message가 없습니다: {topic}")
            schema = infer_schema_from_rows(sample_rows)
        except ExternalConnectionDiscoveryError:
            raise
        except Exception as error:
            raise ExternalConnectionDiscoveryError(f"Kafka schema discovery failed: {error.__class__.__name__}") from error

        return ExternalConnectionInspectResult(
            connector_type=request.connector_type,
            resource=request.resource,
            resource_label=request.resource_label or "kafka_topic",
            detected_format="Kafka JSON message",
            detected_dataset=topic,
            confidence="Medium",
            recommended_role="Streaming Source Dataset",
            schema_preview=schema,
            sample_rows=sample_rows,
            bytes=0,
            file_count=None,
            row_count=len(sample_rows),
            row_count_status="sample_only",
            message=f"{topic} topic에서 {len(schema)}개 field를 확인했습니다.",
        )

    def _inspect_folder(self, path: Path, request: ExternalConnectionInspectRequest) -> ExternalConnectionInspectResult:
        files = [file for file in path.rglob("*") if file.is_file()]
        if not files:
            raise ExternalConnectionDiscoveryError(f"Folder가 비어 있습니다: {request.resource}")

        supported_files = [file for file in files if file.suffix.lower() in SUPPORTED_FILE_SUFFIXES]
        if not supported_files:
            raise ExternalConnectionDiscoveryError(
                f"지원하는 CSV/JSON/JSONL/Parquet 파일을 찾지 못했습니다: {request.resource}"
            )

        parquet_files = [file for file in supported_files if file.suffix.lower() == ".parquet"]
        representative = sorted(parquet_files or supported_files)[0]
        result = self._inspect_file(representative, request, file_count=len(files), total_bytes=sum_file_bytes(files))
        if parquet_files:
            result.detected_format = "Parquet directory"
        result.file_count = len(files)
        result.message = f"{len(files)}개 파일 중 {representative.name} metadata로 schema를 확인했습니다."
        return result

    def _inspect_file(
        self,
        path: Path,
        request: ExternalConnectionInspectRequest,
        file_count: int,
        total_bytes: int | None = None,
    ) -> ExternalConnectionInspectResult:
        suffix = path.suffix.lower()
        if suffix == ".csv":
            schema, sample_rows = inspect_csv_file(path, request.sample_size)
            detected_format = "CSV"
            row_count = None
            row_count_status = "not_measured"
        elif suffix == ".jsonl":
            schema, sample_rows = inspect_jsonl_file(path, request.sample_size)
            detected_format = "JSONL"
            row_count = None
            row_count_status = "not_measured"
        elif suffix == ".json":
            schema, sample_rows = inspect_json_file(path, request.sample_size)
            detected_format = "JSON"
            row_count = len(sample_rows) if isinstance(sample_rows, list) else None
            row_count_status = "sample_only"
        elif suffix == ".parquet":
            schema, sample_rows, row_count = inspect_parquet_file(path, request.sample_size)
            detected_format = "Parquet file" if file_count == 1 else "Parquet directory"
            row_count_status = "metadata"
        else:
            raise ExternalConnectionDiscoveryError(f"지원하지 않는 파일 확장자입니다: {path.suffix}")

        if not schema:
            raise ExternalConnectionDiscoveryError(f"Schema field를 찾지 못했습니다: {request.resource}")

        return ExternalConnectionInspectResult(
            connector_type=request.connector_type,
            resource=request.resource,
            resource_label=request.resource_label or default_resource_label(request.connector_type),
            detected_format=detected_format,
            detected_dataset=detect_dataset_label(path),
            confidence=detect_confidence(path, suffix),
            recommended_role="Source Dataset",
            schema_preview=schema,
            sample_rows=sample_rows,
            bytes=total_bytes if total_bytes is not None else path.stat().st_size,
            file_count=file_count,
            row_count=row_count,
            row_count_status=row_count_status,
            message=f"{path.name}에서 {len(schema)}개 field를 확인했습니다.",
        )


def resolve_local_path(resource: str) -> Path:
    requested = Path(resource).expanduser()
    candidates = [requested] if requested.is_absolute() else [Path.cwd() / requested, Path(__file__).resolve().parents[3] / requested]
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()
    raise ExternalConnectionDiscoveryError(f"Local path를 찾을 수 없습니다: {resource}")


def inspect_csv_file(path: Path, sample_size: int) -> tuple[list[ColumnSchema], list[dict[str, object]]]:
    try:
        with path.open(newline="", encoding="utf-8") as csv_file:
            reader = csv.DictReader(csv_file)
            if not reader.fieldnames:
                raise ExternalConnectionDiscoveryError(f"CSV header가 없습니다: {path}")
            fieldnames = [field.strip() for field in reader.fieldnames]
            values_by_column: dict[str, list[str]] = {field: [] for field in fieldnames}
            sample_rows: list[dict[str, object]] = []
            for row in reader:
                cleaned = {field: row.get(field) or "" for field in fieldnames}
                if len(sample_rows) < sample_size:
                    sample_rows.append(cleaned)
                for field, value in cleaned.items():
                    if value != "":
                        values_by_column[field].append(value)
                if len(sample_rows) >= sample_size and all(values_by_column.values()):
                    break
    except UnicodeDecodeError as error:
        raise ExternalConnectionDiscoveryError(f"CSV file은 UTF-8로 읽을 수 있어야 합니다: {path}") from error

    schema = [ColumnSchema(name=field, type=infer_column_type(values_by_column[field])) for field in fieldnames]
    return schema, sample_rows


def inspect_jsonl_file(path: Path, sample_size: int) -> tuple[list[ColumnSchema], list[dict[str, object]]]:
    sample_rows: list[dict[str, object]] = []
    with path.open(encoding="utf-8") as jsonl_file:
        for line_number, line in enumerate(jsonl_file, start=1):
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as error:
                raise ExternalConnectionDiscoveryError(f"JSONL parse 실패 {path}:{line_number}") from error
            if not isinstance(row, dict):
                raise ExternalConnectionDiscoveryError(f"JSONL row는 object여야 합니다: {path}:{line_number}")
            sample_rows.append(row)
            if len(sample_rows) >= sample_size:
                break

    if not sample_rows:
        raise ExternalConnectionDiscoveryError(f"JSONL sample row가 없습니다: {path}")
    return infer_schema_from_rows(sample_rows), sample_rows


def inspect_json_file(path: Path, sample_size: int) -> tuple[list[ColumnSchema], list[dict[str, object]]]:
    with path.open(encoding="utf-8") as json_file:
        payload = json.load(json_file)
    if isinstance(payload, list):
        sample_rows = [row for row in payload[:sample_size] if isinstance(row, dict)]
    elif isinstance(payload, dict):
        sample_rows = [payload]
    else:
        raise ExternalConnectionDiscoveryError(f"JSON root는 object 또는 object array여야 합니다: {path}")
    if not sample_rows:
        raise ExternalConnectionDiscoveryError(f"JSON sample object가 없습니다: {path}")
    return infer_schema_from_rows(sample_rows), sample_rows


def inspect_parquet_file(path: Path, sample_size: int) -> tuple[list[ColumnSchema], list[dict[str, object]], int]:
    try:
        parquet_file = pq.ParquetFile(path)
        schema = [ColumnSchema(name=field.name, type=str(field.type)) for field in parquet_file.schema_arrow]
        row_count = parquet_file.metadata.num_rows if parquet_file.metadata else 0
        sample_rows: list[dict[str, object]] = []
        if row_count > 0:
            table = parquet_file.read_row_group(0, columns=[field.name for field in parquet_file.schema_arrow]).slice(0, sample_size)
            sample_rows = table.to_pylist()
    except Exception as error:
        raise ExternalConnectionDiscoveryError(f"Parquet metadata를 읽지 못했습니다: {path}") from error
    return schema, sample_rows, row_count


def inspect_bytes_object(
    object_key: str,
    body: bytes,
    sample_size: int,
) -> tuple[list[ColumnSchema], list[dict[str, object]], str, int | None, str]:
    suffix = Path(object_key).suffix.lower()
    if suffix == ".csv":
        text = body.decode("utf-8")
        reader = csv.DictReader(StringIO(text))
        if not reader.fieldnames:
            raise ExternalConnectionDiscoveryError(f"S3 CSV header가 없습니다: {object_key}")
        rows = []
        values_by_column: dict[str, list[str]] = {field: [] for field in reader.fieldnames}
        for row in reader:
            cleaned = {field: row.get(field) or "" for field in reader.fieldnames}
            if len(rows) < sample_size:
                rows.append(cleaned)
            for field, value in cleaned.items():
                if value:
                    values_by_column[field].append(value)
            if len(rows) >= sample_size and all(values_by_column.values()):
                break
        return [ColumnSchema(name=field, type=infer_column_type(values_by_column[field])) for field in reader.fieldnames], rows, "CSV", None, "sample_only"
    if suffix == ".jsonl":
        rows = []
        for line_number, line in enumerate(body.decode("utf-8").splitlines(), start=1):
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as error:
                raise ExternalConnectionDiscoveryError(f"S3 JSONL parse 실패 {object_key}:{line_number}") from error
            if not isinstance(row, dict):
                raise ExternalConnectionDiscoveryError(f"S3 JSONL row는 object여야 합니다: {object_key}:{line_number}")
            rows.append(row)
            if len(rows) >= sample_size:
                break
        if not rows:
            raise ExternalConnectionDiscoveryError(f"S3 JSONL sample row가 없습니다: {object_key}")
        return infer_schema_from_rows(rows), rows, "JSONL", None, "sample_only"
    if suffix == ".json":
        payload = json.loads(body.decode("utf-8"))
        rows = [row for row in payload[:sample_size] if isinstance(row, dict)] if isinstance(payload, list) else [payload] if isinstance(payload, dict) else []
        if not rows:
            raise ExternalConnectionDiscoveryError(f"S3 JSON sample object가 없습니다: {object_key}")
        return infer_schema_from_rows(rows), rows, "JSON", len(rows), "sample_only"
    if suffix == ".parquet":
        try:
            parquet_file = pq.ParquetFile(BytesIO(body))
            schema = [ColumnSchema(name=field.name, type=str(field.type)) for field in parquet_file.schema_arrow]
            row_count = parquet_file.metadata.num_rows if parquet_file.metadata else 0
            rows = []
            if row_count > 0:
                table = parquet_file.read_row_group(0, columns=[field.name for field in parquet_file.schema_arrow]).slice(0, sample_size)
                rows = table.to_pylist()
        except Exception as error:
            raise ExternalConnectionDiscoveryError(f"S3 Parquet metadata를 읽지 못했습니다: {object_key}") from error
        return schema, rows, "Parquet file", row_count, "metadata"
    raise ExternalConnectionDiscoveryError(f"S3 schema discovery는 CSV/JSON/JSONL/Parquet object만 지원합니다: {object_key}")


def infer_schema_from_rows(rows: list[dict[str, object]]) -> list[ColumnSchema]:
    values_by_column: dict[str, list[object]] = defaultdict(list)
    for row in rows:
        for key, value in row.items():
            if value is not None:
                values_by_column[key].append(value)
    return [ColumnSchema(name=key, type=infer_json_type(values)) for key, values in values_by_column.items()]


def infer_json_type(values: list[object]) -> str:
    if not values:
        return "string"
    if all(isinstance(value, bool) for value in values):
        return "boolean"
    if all(isinstance(value, int) and not isinstance(value, bool) for value in values):
        return "integer"
    if all(isinstance(value, int | float) and not isinstance(value, bool) for value in values):
        return "number"
    if all(isinstance(value, list) for value in values):
        return "array"
    if all(isinstance(value, dict) for value in values):
        return "object"
    return "string"


def sum_file_bytes(files: list[Path]) -> int:
    return sum(file.stat().st_size for file in files)


def detect_dataset_label(path: Path) -> str:
    path_text = str(path).lower()
    if "taxi" in path_text or "trip" in path_text:
        return "Delivery / trip logs"
    if "review" in path_text or "amazon" in path_text or "voc" in path_text:
        return "Product reviews / VOC"
    if "mep" in path_text or "product" in path_text:
        return "Product catalog / image metadata"
    if "ecommerce" in path_text or "behavior" in path_text:
        return "Commerce behavior events"
    if "product_health" in path_text:
        return "Product Health local source"
    return "Local dataset"


def detect_confidence(path: Path, suffix: str) -> str:
    if suffix in {".jsonl", ".csv", ".json"} and path.stat().st_size > 0:
        return "High"
    if suffix == ".parquet":
        return "High"
    return "Medium"


def default_resource_label(connector_type: str) -> str:
    if connector_type == "local_file":
        return "file_path"
    if connector_type == "local_folder":
        return "folder_path"
    return "resource"


def required_scope(request: ExternalConnectionInspectRequest, message: str) -> str:
    scope = request.options.get("scope", "").strip()
    if not scope:
        raise ExternalConnectionDiscoveryError(message)
    return scope


def split_postgres_scope(scope: str) -> tuple[str, str]:
    parts = [part.strip() for part in scope.split(".") if part.strip()]
    if len(parts) == 1:
        return "public", parts[0]
    if len(parts) == 2:
        return parts[0], parts[1]
    raise ExternalConnectionDiscoveryError("PostgreSQL table scope는 schema.table 형식이어야 합니다.")


def split_dot_scope(scope: str, label: str) -> tuple[str, str]:
    parts = [part.strip() for part in scope.split(".") if part.strip()]
    if len(parts) != 2:
        raise ExternalConnectionDiscoveryError(f"{label} scope는 database.collection 형식이어야 합니다.")
    return parts[0], parts[1]


def quote_sql_identifier(identifier: str) -> str:
    return '"' + identifier.replace('"', '""') + '"'


def validate_discovery_secret_refs(request: ExternalConnectionInspectRequest) -> None:
    try:
        validate_no_raw_secret_fields(request)
    except ExternalConnectionRuntimeCheckError as error:
        raise ExternalConnectionDiscoveryError(str(error)) from error
