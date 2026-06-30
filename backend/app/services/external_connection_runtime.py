import os
import re
from dataclasses import dataclass
from urllib.parse import quote, urlsplit

from app.domain.schemas import ExternalConnectionTestRequest, ExternalConnectionTestResult

try:
    import boto3
except ImportError:  # pragma: no cover - exercised when optional runtime dependency is absent
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
    from kafka import KafkaAdminClient
except ImportError:  # pragma: no cover
    KafkaAdminClient = None


class ExternalConnectionRuntimeCheckError(ValueError):
    pass


ENV_REF_PATTERN = re.compile(r"^[A-Z][A-Z0-9_]{2,}$")
FORBIDDEN_SECRET_FIELDS = {"password", "access_key", "secret_key", "token", "raw_credential"}


@dataclass(frozen=True)
class ParsedHostResource:
    host: str
    port: int
    database: str | None = None


@dataclass(frozen=True)
class ParsedS3Resource:
    endpoint: str
    bucket: str


class ExternalConnectionRuntimeCheckService:
    def test(self, request: ExternalConnectionTestRequest) -> ExternalConnectionTestResult:
        validate_no_raw_secret_fields(request)
        if request.connector_type == "postgres":
            return self._test_postgres(request)
        if request.connector_type == "mongodb":
            return self._test_mongodb(request)
        if request.connector_type in {"s3", "object_storage"}:
            return self._test_s3(request)
        if request.connector_type == "kafka":
            return self._test_kafka(request)
        raise ExternalConnectionRuntimeCheckError(f"지원하지 않는 connector_type입니다: {request.connector_type}")

    def _test_postgres(self, request: ExternalConnectionTestRequest) -> ExternalConnectionTestResult:
        if psycopg is None:
            raise ExternalConnectionRuntimeCheckError("psycopg runtime dependency가 설치되어 있지 않습니다.")
        parsed = parse_host_resource(request.resource, default_port=5432)
        user = credential_from_env_ref(request.secret_refs, "username")
        password = credential_from_env_ref(request.secret_refs, "password")
        with psycopg.connect(
            host=parsed.host,
            port=parsed.port,
            dbname=parsed.database or request.options.get("database") or "postgres",
            user=user,
            password=password,
            connect_timeout=request.timeout_seconds,
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute("select 1")
                cursor.fetchone()
        return passed_result(
            request,
            ["driver_connect", "lightweight_query"],
            {
                "host": parsed.host,
                "port": parsed.port,
                "database": parsed.database or request.options.get("database") or "postgres",
                "credential_refs_configured": ["username", "password"],
            },
            "PostgreSQL connection test passed. Schema discovery is still separate.",
        )

    def _test_mongodb(self, request: ExternalConnectionTestRequest) -> ExternalConnectionTestResult:
        if pymongo is None:
            raise ExternalConnectionRuntimeCheckError("pymongo runtime dependency가 설치되어 있지 않습니다.")
        user = credential_from_env_ref(request.secret_refs, "username")
        password = credential_from_env_ref(request.secret_refs, "password")
        client = pymongo.MongoClient(
            request.resource,
            username=user,
            password=password,
            serverSelectionTimeoutMS=int(request.timeout_seconds * 1000),
        )
        try:
            client.admin.command("ping")
        finally:
            client.close()
        parsed = urlsplit(request.resource)
        return passed_result(
            request,
            ["driver_connect", "ping"],
            {
                "host": parsed.hostname or request.resource,
                "port": parsed.port or 27017,
                "credential_refs_configured": ["username", "password"],
            },
            "MongoDB connection test passed. Collection schema discovery is still separate.",
        )

    def _test_s3(self, request: ExternalConnectionTestRequest) -> ExternalConnectionTestResult:
        if boto3 is None:
            raise ExternalConnectionRuntimeCheckError("boto3 runtime dependency가 설치되어 있지 않습니다.")
        parsed = parse_s3_resource(request.resource, request.options)
        access_key = credential_from_env_ref(request.secret_refs, "access_key")
        secret_key = credential_from_env_ref(request.secret_refs, "secret_key")
        client = boto3.client(
            "s3",
            endpoint_url=parsed.endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=request.options.get("region", "us-east-1"),
        )
        payload = client.list_objects_v2(Bucket=parsed.bucket, MaxKeys=1)
        return passed_result(
            request,
            ["driver_connect", "bucket_list"],
            {
                "endpoint": parsed.endpoint,
                "bucket": parsed.bucket,
                "object_sample_count": len(payload.get("Contents", [])),
                "credential_refs_configured": ["access_key", "secret_key"],
            },
            "S3/MinIO connection test passed. Object schema discovery is still separate.",
        )

    def _test_kafka(self, request: ExternalConnectionTestRequest) -> ExternalConnectionTestResult:
        if KafkaAdminClient is None:
            raise ExternalConnectionRuntimeCheckError("kafka-python runtime dependency가 설치되어 있지 않습니다.")
        try:
            admin = KafkaAdminClient(
                bootstrap_servers=request.resource,
                client_id=request.options.get("client_id", "asklake-runtime-check"),
                request_timeout_ms=int(request.timeout_seconds * 1000),
            )
            try:
                topics = sorted(admin.list_topics())
            finally:
                admin.close()
        except Exception as error:
            raise ExternalConnectionRuntimeCheckError(redacted_error("Kafka metadata check failed", error)) from error
        return passed_result(
            request,
            ["broker_metadata", "topic_list"],
            {
                "bootstrap_servers": request.resource,
                "topic_count": len(topics),
                "sample_topics": topics[:5],
                "credential_refs_configured": [],
            },
            "Kafka broker metadata check passed. Replay/consume is still separate.",
        )


def validate_no_raw_secret_fields(request: ExternalConnectionTestRequest) -> None:
    if any(field in request.options for field in FORBIDDEN_SECRET_FIELDS):
        raise ExternalConnectionRuntimeCheckError("raw credential field는 connection test request에 포함할 수 없습니다.")
    for key, env_name in request.secret_refs.items():
        if key not in {"username", "password", "access_key", "secret_key"}:
            raise ExternalConnectionRuntimeCheckError(f"지원하지 않는 secret_ref key입니다: {key}")
        if not ENV_REF_PATTERN.match(env_name):
            raise ExternalConnectionRuntimeCheckError("secret_refs에는 raw value가 아니라 환경 변수 이름만 넣어야 합니다.")


def credential_from_env_ref(secret_refs: dict[str, str], key: str) -> str:
    env_name = secret_refs.get(key)
    if not env_name:
        raise ExternalConnectionRuntimeCheckError(f"Missing secret_ref: {key}")
    value = os.environ.get(env_name)
    if not value:
        raise ExternalConnectionRuntimeCheckError(f"Missing env value for secret_ref: {key}")
    return value


def redacted_error(prefix: str, error: Exception) -> str:
    return f"{prefix}: {error.__class__.__name__}"


def parse_host_resource(resource: str, default_port: int) -> ParsedHostResource:
    if "://" in resource:
        parsed = urlsplit(resource)
        if not parsed.hostname:
            raise ExternalConnectionRuntimeCheckError("resource host를 확인할 수 없습니다.")
        database = parsed.path.strip("/") or None
        return ParsedHostResource(parsed.hostname, parsed.port or default_port, database)

    host_port, _, database = resource.partition("/")
    host, separator, port_text = host_port.partition(":")
    if not host:
        raise ExternalConnectionRuntimeCheckError("resource host를 확인할 수 없습니다.")
    port = int(port_text) if separator else default_port
    return ParsedHostResource(host, port, database or None)


def parse_s3_resource(resource: str, options: dict[str, str]) -> ParsedS3Resource:
    if resource.startswith("s3://"):
        parsed = urlsplit(resource)
        endpoint = options.get("endpoint")
        if not endpoint:
            raise ExternalConnectionRuntimeCheckError("s3:// resource는 options.endpoint가 필요합니다.")
        return ParsedS3Resource(endpoint.rstrip("/"), parsed.netloc)

    parsed = urlsplit(resource.rstrip("/"))
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ExternalConnectionRuntimeCheckError("S3/MinIO resource는 http(s) endpoint/bucket 또는 s3://bucket 형식이어야 합니다.")
    path_parts = [part for part in parsed.path.split("/") if part]
    if not path_parts:
        raise ExternalConnectionRuntimeCheckError("S3/MinIO bucket을 resource path에 포함해야 합니다.")
    endpoint = f"{parsed.scheme}://{parsed.netloc}"
    return ParsedS3Resource(endpoint, quote(path_parts[0], safe=""))


def passed_result(
    request: ExternalConnectionTestRequest,
    capabilities: list[str],
    safe_summary: dict[str, object],
    message: str,
) -> ExternalConnectionTestResult:
    return ExternalConnectionTestResult(
        status="passed",
        connector_type=request.connector_type,
        checked_capabilities=capabilities,
        safe_summary=safe_summary,
        secret_values_exposed=False,
        schema_discovery_completed=False,
        message=message,
    )
