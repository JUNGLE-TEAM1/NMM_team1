from pathlib import Path

from app.domain.runtime_config import StorageConfig
from app.services.week2_storage_adapter import Week2StorageAdapter


def test_storage_adapter_maps_s3_uri_to_local_fallback_path(tmp_path: Path) -> None:
    """S3-compatible prefix와 local fallback path가 같은 run_id prefix를 공유해야 한다."""

    location = Week2StorageAdapter().build_location(
        StorageConfig(
            profile="minio",
            bucket="asklake-demo",
            prefix="reviews/gold/run_id=<run_id>/",
            local_fallback_root=str(tmp_path),
        ),
        run_id="run_reviews_demo_001",
        file_name="dataset_reviews_gold.parquet",
    )

    assert location.uri == "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/"
    assert location.prefix == "reviews/gold/run_id=run_reviews_demo_001/"
    assert location.local_path == tmp_path / "reviews" / "gold" / "run_id=run_reviews_demo_001" / "dataset_reviews_gold.parquet"


def test_storage_adapter_uploads_file_to_minio_endpoint(tmp_path: Path, monkeypatch) -> None:
    """local fallback 파일을 같은 prefix의 MinIO object로 업로드한다."""

    monkeypatch.setenv("ASKLAKE_TEST_MINIO_ACCESS_KEY", "minioadmin")
    monkeypatch.setenv("ASKLAKE_TEST_MINIO_SECRET_KEY", "minioadmin")
    local_file = tmp_path / "reviews" / "gold" / "run_id=run_reviews_demo_001" / "dataset_reviews_gold.parquet"
    local_file.parent.mkdir(parents=True)
    local_file.write_bytes(b"parquet-bytes")
    storage = StorageConfig(
        profile="minio",
        bucket="asklake-demo",
        endpoint="http://localhost:9000",
        prefix="reviews/gold/run_id=<run_id>/",
        local_fallback_root=str(tmp_path),
        access_key_env="ASKLAKE_TEST_MINIO_ACCESS_KEY",
        secret_key_env="ASKLAKE_TEST_MINIO_SECRET_KEY",
        auto_create_bucket=True,
    )
    location = Week2StorageAdapter().build_location(
        storage,
        run_id="run_reviews_demo_001",
        file_name="dataset_reviews_gold.parquet",
    )
    http_client = FakeHttpClient()

    result = Week2StorageAdapter().upload_file(storage, location, http_client=http_client)

    assert result.object_uri == "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.parquet"
    assert result.bytes == len(b"parquet-bytes")
    assert result.status_code == 200
    assert [request["url"] for request in http_client.requests] == [
        "http://localhost:9000/asklake-demo",
        "http://localhost:9000/asklake-demo/reviews/gold/run_id%3Drun_reviews_demo_001/dataset_reviews_gold.parquet",
    ]
    object_request = http_client.requests[-1]
    assert object_request["content"] == b"parquet-bytes"
    assert object_request["headers"]["Authorization"].startswith("AWS4-HMAC-SHA256")
    assert object_request["headers"]["x-amz-content-sha256"]


class FakeHttpClient:
    """httpx 없이 adapter upload request 모양만 기록하는 테스트 client."""

    def __init__(self) -> None:
        self.requests = []

    def put(self, url: str, content: bytes, headers: dict[str, str], timeout: float):
        self.requests.append(
            {
                "url": url,
                "content": content,
                "headers": headers,
                "timeout": timeout,
            }
        )
        return FakeResponse()


class FakeResponse:
    """adapter가 기대하는 최소 response contract."""

    status_code = 200
    headers = {"etag": '"etag-demo"'}
    text = ""

    def raise_for_status(self) -> None:
        return None
