from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


RuntimeInputFormat = Literal["json", "jsonl", "parquet"]
RuntimeSourceType = Literal["local_file", "s3", "postgres", "mongodb", "kafka"]


class StorageConfig(BaseModel):
    """M2 runtime output을 local fallback과 S3-compatible object storage에 매핑하는 설정.

    secret 값은 넣지 않고 env 이름만 저장한다.
    """

    profile: Literal["local", "minio", "s3"] = "minio"
    bucket: str = Field(default="asklake-demo", min_length=1)
    endpoint: str | None = None
    region: str = Field(default="us-east-1", min_length=1)
    prefix: str | None = Field(default=None, min_length=1)
    local_fallback_root: str = Field(default="data/week2", min_length=1)
    access_key_env: str = Field(default="ASKLAKE_DEMO_MINIO_ACCESS_KEY", min_length=1)
    secret_key_env: str = Field(default="ASKLAKE_DEMO_MINIO_SECRET_KEY", min_length=1)
    auto_create_bucket: bool = False
    upload_timeout_seconds: float = Field(default=30.0, gt=0)


class RuntimeSourceInput(BaseModel):
    """M2 runner가 source별 입력 위치와 데이터 형식을 받기 위한 설정.

    source 의미, Bronze/Silver/Gold 변환 규칙은 M3 `TransformSpec` 책임이므로 여기에 넣지 않는다.
    기존 `input_format`/`input_path`와 새 `format`/`path`를 모두 받아서 UI source
    connection 계약으로 넘어가는 동안 하위 호환을 유지한다.
    """

    source_id: str = Field(min_length=1)
    source_type: RuntimeSourceType = "local_file"
    format: RuntimeInputFormat | None = None
    path: str | None = Field(default=None, min_length=1)
    input_format: RuntimeInputFormat | None = None
    input_path: str | None = Field(default=None, min_length=1)
    connection_ref: str | None = Field(default=None, min_length=1)
    table: str | None = Field(default=None, min_length=1)
    topic: str | None = Field(default=None, min_length=1)
    query: str | None = Field(default=None, min_length=1)
    message_format: str | None = Field(default=None, min_length=1)
    output_file_name: str | None = Field(default=None, min_length=1)
    options: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_compatible_input_fields(self) -> "RuntimeSourceInput":
        """legacy 필드와 새 필드가 동시에 들어와도 같은 뜻인지 확인한다."""

        if self.format is not None and self.input_format is not None and self.format != self.input_format:
            raise ValueError("format and input_format must match when both are provided")
        if self.path is not None and self.input_path is not None and self.path != self.input_path:
            raise ValueError("path and input_path must match when both are provided")
        if self.source_type == "local_file" and (self.effective_format is None or self.effective_path is None):
            raise ValueError("local_file source requires format/path or input_format/input_path")
        return self

    @property
    def effective_format(self) -> RuntimeInputFormat | None:
        """새 `format`을 우선하고 없으면 legacy `input_format`을 사용한다."""

        return self.format or self.input_format

    @property
    def effective_path(self) -> str | None:
        """새 `path`를 우선하고 없으면 legacy `input_path`를 사용한다."""

        return self.path or self.input_path


class RuntimeConfig(BaseModel):
    """M2 runner가 어떤 파일을 읽고 어디에 결과를 쓸지 받는 설정 모델.

    `output_root + storage` 조합은 run_id 기반 local/MinIO 경로를 함께 계산할 때 쓴다.
    """

    runner: Literal["local_runner", "spark_runner"] = "spark_runner"
    input_format: RuntimeInputFormat | None = None
    input_path: str | None = Field(default=None, min_length=1)
    source_inputs: list[RuntimeSourceInput] = Field(default_factory=list)
    output_format: Literal["parquet"] = "parquet"
    output_path: str | None = Field(default=None, min_length=1)
    output_root: str | None = Field(default=None, min_length=1)
    storage: StorageConfig | None = None
    app_name: str = Field(default="asklake-week2", min_length=1)
    options: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def require_output_location(self) -> "RuntimeConfig":
        """단일 입력 또는 여러 source 입력에 필요한 최소 위치 설정을 검증한다."""

        if self.source_inputs:
            if self.output_path is not None:
                raise ValueError("source_inputs mode requires output_root or storage instead of output_path")
            if self.output_root is None and self.storage is None:
                raise ValueError("source_inputs mode requires output_root or storage")
            return self

        if self.input_format is None or self.input_path is None:
            raise ValueError("input_format and input_path are required when source_inputs is empty")

        if self.output_path is None and self.output_root is None:
            raise ValueError("Either output_path or output_root is required")
        return self
