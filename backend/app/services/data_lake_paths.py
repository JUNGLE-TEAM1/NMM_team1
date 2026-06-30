from pathlib import Path


DATA_LAKE_ROOT = Path("data/lake")
BRONZE_ROOT = DATA_LAKE_ROOT / "bronze"
SILVER_ROOT = DATA_LAKE_ROOT / "silver"
GOLD_ROOT = DATA_LAKE_ROOT / "gold"


def source_snapshot_root() -> Path:
    return BRONZE_ROOT / "source_snapshots"


def silver_dataset_path(dataset_name: str) -> Path:
    return SILVER_ROOT / f"{safe_file_stem(dataset_name)}.parquet"


def gold_run_path(run_id: str, output_name: str) -> Path:
    return GOLD_ROOT / f"run_id={safe_file_stem(run_id)}" / f"{safe_file_stem(output_name)}.parquet"


def expected_gold_object_uri(run_id: str, output_name: str) -> str:
    return f"s3://asklake-demo/product_health/gold/run_id={run_id}/{safe_file_stem(output_name)}.parquet"


def safe_file_stem(value: str) -> str:
    return "".join(character if character.isalnum() or character in {"_", "-"} else "_" for character in value).strip("_") or "dataset"
