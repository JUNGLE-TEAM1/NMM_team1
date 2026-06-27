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
