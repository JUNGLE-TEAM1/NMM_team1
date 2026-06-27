from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class StorageConfig(BaseModel):
    """M2 runtime output을 local fallback과 S3-compatible object storage에 매핑하는 설정.

    secret 값은 이 모델에 직접 넣지 않는다. Git에 남겨도 되는 것은 env 이름뿐이고,
    실제 access key/secret key 값은 upload 실행 시점의 환경 변수에서 읽는다.
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


class RuntimeConfig(BaseModel):
    """M2 runner가 어떤 파일을 읽고 어디에 결과를 쓸지 받는 설정 모델.

    `output_path`는 정확한 파일 경로를 직접 지정할 때 쓰고,
    `output_root + storage` 조합은 run_id 기반 prefix 규칙으로 local/MinIO 경로를 함께 계산할 때 쓴다.
    """

    runner: Literal["local_runner", "spark_runner"] = "spark_runner"
    input_format: Literal["json", "jsonl", "parquet"]
    input_path: str = Field(min_length=1)
    output_format: Literal["parquet"] = "parquet"
    output_path: str | None = Field(default=None, min_length=1)
    output_root: str | None = Field(default=None, min_length=1)
    storage: StorageConfig | None = None
    app_name: str = Field(default="asklake-week2", min_length=1)
    options: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def require_output_location(self) -> "RuntimeConfig":
        """결과를 저장할 위치가 하나는 있는지 검증한다."""

        if self.output_path is None and self.output_root is None:
            raise ValueError("Either output_path or output_root is required")
        return self
