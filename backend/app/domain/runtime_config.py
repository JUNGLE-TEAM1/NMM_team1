from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class RuntimeConfig(BaseModel):
    """M2 runner가 어떤 파일을 읽고 어디에 결과를 쓸지 받는 설정 모델."""

    runner: Literal["local_runner", "spark_runner"] = "spark_runner"
    input_format: Literal["json", "jsonl", "parquet"]
    input_path: str = Field(min_length=1)
    output_format: Literal["parquet"] = "parquet"
    output_path: str | None = Field(default=None, min_length=1)
    output_root: str | None = Field(default=None, min_length=1)
    app_name: str = Field(default="asklake-week2", min_length=1)
    options: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def require_output_location(self) -> "RuntimeConfig":
        """결과를 저장할 위치가 하나는 있는지 검증한다."""

        if self.output_path is None and self.output_root is None:
            raise ValueError("Either output_path or output_root is required")
        return self
