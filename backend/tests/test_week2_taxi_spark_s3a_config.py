import pytest

from app.services.week2_taxi_spark_runner import (
    TaxiSparkConfig,
    Week2TaxiSparkRunnerError,
    configure_s3a,
    env_credential,
    normalized_s3a_output_uri,
    validate_output_mode,
)


def test_direct_s3a_output_uri_requires_s3a_scheme() -> None:
    """direct write는 Spark S3A filesystem을 쓰는 경로만 허용한다."""

    with pytest.raises(Week2TaxiSparkRunnerError, match="must start with s3a://"):
        validate_output_mode(
            TaxiSparkConfig(
                input_path="data/raw/taxi.parquet",
                output_root="data/results",
                direct_s3a_output_uri="s3://asklake-demo/taxi/gold/",
            )
        )


def test_direct_s3a_output_cannot_mix_adapter_upload() -> None:
    """direct S3A write와 adapter upload를 한 evidence에서 섞지 않는다."""

    with pytest.raises(Week2TaxiSparkRunnerError, match="cannot be combined"):
        validate_output_mode(
            TaxiSparkConfig(
                input_path="data/raw/taxi.parquet",
                output_root="data/results",
                direct_s3a_output_uri="s3a://asklake-demo/taxi/gold/",
                upload_to_object_storage=True,
            )
        )


def test_normalized_s3a_output_uri_keeps_directory_shape() -> None:
    """Spark Parquet writer가 output prefix를 directory로 쓰도록 마지막 slash를 보장한다."""

    assert normalized_s3a_output_uri("s3a://asklake-demo/taxi/gold/run_id=1") == "s3a://asklake-demo/taxi/gold/run_id=1/"
    assert normalized_s3a_output_uri("s3a://asklake-demo/taxi/gold/run_id=1/") == "s3a://asklake-demo/taxi/gold/run_id=1/"


def test_env_credential_requires_named_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """secret 값은 config 파일 대신 지정된 env에서만 읽는다."""

    monkeypatch.delenv("ASKLAKE_TEST_MISSING_KEY", raising=False)

    with pytest.raises(Week2TaxiSparkRunnerError, match="Missing S3A credential env"):
        env_credential("ASKLAKE_TEST_MISSING_KEY")


def test_configure_s3a_sets_minio_compatible_options(monkeypatch: pytest.MonkeyPatch) -> None:
    """MinIO endpoint에 맞는 S3A Hadoop 설정을 Spark builder에 넣는다."""

    monkeypatch.setenv("ASKLAKE_TEST_ACCESS_KEY", "minioadmin")
    monkeypatch.setenv("ASKLAKE_TEST_SECRET_KEY", "minioadmin")
    builder = FakeSparkBuilder()

    configure_s3a(
        builder,
        TaxiSparkConfig(
            input_path="data/raw/taxi.parquet",
            output_root="data/results",
            direct_s3a_output_uri="s3a://asklake-demo/taxi/gold/",
            s3a_endpoint="http://m2-minio:9000",
            s3a_access_key_env="ASKLAKE_TEST_ACCESS_KEY",
            s3a_secret_key_env="ASKLAKE_TEST_SECRET_KEY",
        ),
    )

    assert builder.options["spark.hadoop.fs.s3a.endpoint"] == "http://m2-minio:9000"
    assert builder.options["spark.hadoop.fs.s3a.access.key"] == "minioadmin"
    assert builder.options["spark.hadoop.fs.s3a.secret.key"] == "minioadmin"
    assert builder.options["spark.hadoop.fs.s3a.path.style.access"] == "true"
    assert builder.options["spark.hadoop.fs.s3a.connection.ssl.enabled"] == "false"
    assert builder.options["spark.hadoop.fs.s3a.impl"] == "org.apache.hadoop.fs.s3a.S3AFileSystem"


class FakeSparkBuilder:
    """SparkSession.builder.config와 같은 chaining만 흉내 내는 테스트 double."""

    def __init__(self) -> None:
        self.options: dict[str, str] = {}

    def config(self, key: str, value: str) -> "FakeSparkBuilder":
        self.options[key] = value
        return self
