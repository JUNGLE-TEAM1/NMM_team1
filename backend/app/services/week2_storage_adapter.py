import hashlib
import hmac
import os
import re
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlsplit

import httpx

from app.domain.runtime_config import StorageConfig
from app.services.week2_local_runner import repo_root


@dataclass(frozen=True)
class StorageLocation:
    """하나의 output이 local과 object storage에서 어디에 있어야 하는지 담는 값.

    `uri`는 dataset/run prefix까지만 가리키고, `object_uri`는 실제 파일 object까지 가리킨다.
    M5 Catalog는 prefix 단위 URI를 보여주고, upload smoke는 object URI를 검증한다.
    """

    uri: str | None
    bucket: str | None
    prefix: str
    object_key: str
    object_uri: str | None
    local_path: Path


@dataclass(frozen=True)
class StorageUploadResult:
    """MinIO/S3-compatible object upload smoke 결과.

    runner 결과에는 secret이나 signed header를 남기지 않는다.
    """

    object_uri: str | None
    endpoint: str
    status_code: int
    etag: str | None
    bytes: int


class Week2StorageAdapter:
    """MinIO/S3-compatible storage 계약을 local fallback과 object upload 경로로 해석한다.

    이 adapter는 변환 의미를 모르고 저장 위치만 계산한다.
    """

    def build_location(
        self,
        storage: StorageConfig | dict,
        run_id: str,
        file_name: str,
        local_root: str | Path | None = None,
        default_prefix: str | None = None,
    ) -> StorageLocation:
        """storage 설정과 run_id로 S3 URI, object key, local file path를 만든다."""

        config = StorageConfig.model_validate(storage)
        prefix = normalize_prefix(apply_run_id(config.prefix or default_prefix, run_id))
        root = resolve_local_root(local_root or config.local_fallback_root)
        safe_file_name = normalized_file_name(file_name)
        # object_key와 local_path를 같은 prefix에서 만들어 local/remote drift를 막는다.
        object_key = f"{prefix}{safe_file_name}"
        return StorageLocation(
            uri=s3_uri(config.bucket, prefix),
            bucket=config.bucket,
            prefix=prefix,
            object_key=object_key,
            object_uri=s3_uri(config.bucket, object_key),
            local_path=root / Path(prefix) / safe_file_name,
        )

    def upload_file(
        self,
        storage: StorageConfig | dict,
        location: StorageLocation,
        http_client: Any | None = None,
    ) -> StorageUploadResult:
        """local fallback 파일을 MinIO/S3-compatible object로 업로드한다.

        upload는 runner option으로 명시됐을 때만 호출된다. 기본 실행은 local fallback을 유지해서
        MinIO가 꺼져 있어도 기존 workflow/catalog smoke가 깨지지 않는다.
        """

        config = StorageConfig.model_validate(storage)
        if config.profile == "local":
            raise Week2StorageAdapterError("local storage profile does not support object upload")
        if not config.endpoint:
            raise Week2StorageAdapterError("storage endpoint is required for object upload")
        if not location.bucket:
            raise Week2StorageAdapterError("storage bucket is required for object upload")
        if not location.object_uri:
            raise Week2StorageAdapterError("storage object URI is required for object upload")
        if not location.local_path.exists():
            raise Week2StorageAdapterError(f"Local file not found for upload: {location.local_path}")

        endpoint = normalize_endpoint(config.endpoint)
        access_key = credential_from_env(config.access_key_env)
        secret_key = credential_from_env(config.secret_key_env)
        if config.auto_create_bucket:
            create_bucket(config, endpoint, access_key, secret_key, http_client)

        content = location.local_path.read_bytes()
        object_url, canonical_uri = object_request_target(endpoint, location.bucket, location.object_key)
        response = signed_put(
            object_url,
            canonical_uri,
            content,
            config,
            access_key,
            secret_key,
            http_client,
        )
        response.raise_for_status()
        return StorageUploadResult(
            object_uri=location.object_uri,
            endpoint=endpoint,
            status_code=response.status_code,
            etag=response.headers.get("etag"),
            bytes=len(content),
        )


def apply_run_id(prefix: str | None, run_id: str) -> str:
    """`<run_id>` placeholder 또는 기존 `run_id=...` segment를 실제 run_id로 치환한다."""

    if not prefix:
        raise Week2StorageAdapterError("storage prefix is required")
    replaced = prefix.replace("<run_id>", run_id)
    return re.sub(r"run_id=[^/]+", f"run_id={run_id}", replaced)


def normalize_prefix(prefix: str) -> str:
    """S3 URI와 local path가 공유할 prefix를 슬래시 규칙에 맞춘다."""

    normalized = prefix.strip().lstrip("/")
    if not normalized:
        raise Week2StorageAdapterError("storage prefix is required")
    return normalized if normalized.endswith("/") else f"{normalized}/"


def resolve_local_root(path_value: str | Path) -> Path:
    """상대 local fallback root는 repository root 기준으로 해석한다."""

    path = Path(path_value)
    return path if path.is_absolute() else repo_root() / path


def normalized_file_name(file_name: str) -> str:
    """storage adapter가 임의 하위 경로를 file_name으로 받지 않도록 막는다."""

    path = Path(file_name)
    if path.name != file_name:
        raise Week2StorageAdapterError("file_name must not include directory segments")
    if not file_name:
        raise Week2StorageAdapterError("file_name is required")
    return file_name


def s3_uri(bucket: str, prefix: str) -> str:
    """bucket과 prefix를 S3-compatible URI로 만든다."""

    return f"s3://{bucket}/{prefix}"


def normalize_endpoint(endpoint: str) -> str:
    """endpoint를 trailing slash 없는 HTTP(S) URL로 정규화한다."""

    normalized = endpoint.rstrip("/")
    parsed = urlsplit(normalized)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise Week2StorageAdapterError("storage endpoint must be an http(s) URL")
    return normalized


def credential_from_env(env_name: str) -> str:
    """환경 변수 이름으로 credential을 읽되 실제 값은 로그나 문서에 남기지 않는다."""

    value = os.environ.get(env_name)
    if not value:
        raise Week2StorageAdapterError(f"Missing storage credential env: {env_name}")
    return value


def create_bucket(
    config: StorageConfig,
    endpoint: str,
    access_key: str,
    secret_key: str,
    http_client: Any | None,
    ) -> None:
    """local smoke 재현을 위해 bucket이 없으면 만들고, 이미 있으면 통과시킨다."""

    bucket_url, canonical_uri = bucket_request_target(endpoint, config.bucket)
    response = signed_put(
        bucket_url,
        canonical_uri,
        b"",
        config,
        access_key,
        secret_key,
        http_client,
    )
    if response.status_code not in {200, 409}:
        response.raise_for_status()


def bucket_request_target(endpoint: str, bucket: str) -> tuple[str, str]:
    """bucket 생성용 path-style URL과 canonical URI를 만든다."""

    quoted_bucket = quote(bucket, safe="")
    return f"{endpoint}/{quoted_bucket}", f"/{quoted_bucket}"


def object_request_target(endpoint: str, bucket: str, object_key: str) -> tuple[str, str]:
    """object upload용 path-style URL과 canonical URI를 만든다."""

    bucket_uri = quote(bucket, safe="")
    key_uri = quote(object_key, safe="/")
    canonical_uri = f"/{bucket_uri}/{key_uri}"
    return f"{endpoint}{canonical_uri}", canonical_uri


def signed_put(
    url: str,
    canonical_uri: str,
    content: bytes,
    config: StorageConfig,
    access_key: str,
    secret_key: str,
    http_client: Any | None,
):
    """AWS SigV4로 서명한 PUT 요청을 보낸다.

    multipart, STS, IAM role은 후속 SDK 도입 결정으로 둔다.
    """

    headers = signed_put_headers(
        url=url,
        canonical_uri=canonical_uri,
        content=content,
        region=config.region,
        access_key=access_key,
        secret_key=secret_key,
    )
    client = http_client or httpx
    return client.put(
        url,
        content=content,
        headers=headers,
        timeout=config.upload_timeout_seconds,
    )


def signed_put_headers(
    url: str,
    canonical_uri: str,
    content: bytes,
    region: str,
    access_key: str,
    secret_key: str,
    now: datetime | None = None,
) -> dict[str, str]:
    """MinIO/S3-compatible PUT 요청에 필요한 AWS SigV4 header를 만든다.

    본문 hash, canonical request, credential scope로 Authorization header를 만든다.
    """

    request_time = now or datetime.now(UTC)
    amz_date = request_time.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = request_time.strftime("%Y%m%d")
    payload_hash = hashlib.sha256(content).hexdigest()
    host = urlsplit(url).netloc
    headers = {
        "content-type": "application/octet-stream",
        "host": host,
        "x-amz-content-sha256": payload_hash,
        "x-amz-date": amz_date,
    }
    signed_headers = ";".join(sorted(headers))
    canonical_headers = "".join(f"{key}:{headers[key]}\n" for key in sorted(headers))
    # canonical_request는 AWS/MinIO가 서버 쪽에서 다시 계산하는 서명 대상이다.
    # path, header 순서, payload hash가 하나라도 달라지면 signature mismatch가 난다.
    canonical_request = "\n".join(
        [
            "PUT",
            canonical_uri,
            "",
            canonical_headers,
            signed_headers,
            payload_hash,
        ]
    )
    credential_scope = f"{date_stamp}/{region}/s3/aws4_request"
    string_to_sign = "\n".join(
        [
            "AWS4-HMAC-SHA256",
            amz_date,
            credential_scope,
            hashlib.sha256(canonical_request.encode()).hexdigest(),
        ]
    )
    signing_key = sigv4_signing_key(secret_key, date_stamp, region)
    signature = hmac.new(signing_key, string_to_sign.encode(), hashlib.sha256).hexdigest()
    headers["Authorization"] = (
        "AWS4-HMAC-SHA256 "
        f"Credential={access_key}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, "
        f"Signature={signature}"
    )
    return headers


def sigv4_signing_key(secret_key: str, date_stamp: str, region: str) -> bytes:
    """날짜, region, service 범위로 AWS SigV4 signing key를 계산한다."""

    date_key = hmac.new(f"AWS4{secret_key}".encode(), date_stamp.encode(), hashlib.sha256).digest()
    region_key = hmac.new(date_key, region.encode(), hashlib.sha256).digest()
    service_key = hmac.new(region_key, b"s3", hashlib.sha256).digest()
    return hmac.new(service_key, b"aws4_request", hashlib.sha256).digest()


class Week2StorageAdapterError(ValueError):
    """Week2 storage path 계약을 계산할 수 없을 때 발생하는 오류."""

    pass
