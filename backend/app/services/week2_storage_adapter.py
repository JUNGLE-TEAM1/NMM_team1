import re
from dataclasses import dataclass
from pathlib import Path

from app.domain.runtime_config import StorageConfig
from app.services.week2_local_runner import repo_root


@dataclass(frozen=True)
class StorageLocation:
    """S3-compatible URI와 local fallback 파일 경로를 함께 담는 계산 결과."""

    uri: str | None
    bucket: str | None
    prefix: str
    local_path: Path


class Week2StorageAdapter:
    """MinIO/S3-compatible storage 계약을 local fallback write 경로로 해석한다."""

    def build_location(
        self,
        storage: StorageConfig | dict,
        run_id: str,
        file_name: str,
        local_root: str | Path | None = None,
        default_prefix: str | None = None,
    ) -> StorageLocation:
        """storage 설정과 run_id로 S3 URI, prefix, local file path를 만든다."""

        config = StorageConfig.model_validate(storage)
        prefix = normalize_prefix(apply_run_id(config.prefix or default_prefix, run_id))
        root = resolve_local_root(local_root or config.local_fallback_root)
        safe_file_name = normalized_file_name(file_name)
        return StorageLocation(
            uri=s3_uri(config.bucket, prefix),
            bucket=config.bucket,
            prefix=prefix,
            local_path=root / Path(prefix) / safe_file_name,
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


class Week2StorageAdapterError(ValueError):
    """Week2 storage path 계약을 계산할 수 없을 때 발생하는 오류."""

    pass
