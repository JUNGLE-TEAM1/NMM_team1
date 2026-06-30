from pathlib import Path

from app.services.data_lake_paths import SILVER_ROOT


PRODUCT_HEALTH_SILVER_ROOT = Path("data/local_sources/product_health/silver")
PRODUCT_HEALTH_GOLD_ROOT = Path("data/local_sources/product_health/gold")


def prepared_silver_path(dataset_name: str, root: Path = PRODUCT_HEALTH_SILVER_ROOT) -> Path | None:
    lake_candidate = SILVER_ROOT / f"{dataset_name}.parquet"
    if lake_candidate.exists():
        return lake_candidate
    candidate = root / f"{dataset_name}.parquet"
    return candidate if candidate.exists() else None


def prepared_gold_path(output_name: str, root: Path = PRODUCT_HEALTH_GOLD_ROOT) -> Path | None:
    for candidate_name in prepared_gold_candidate_names(output_name):
        candidate = root / f"{candidate_name}.parquet"
        if candidate.exists():
            return candidate
    return None


def prepared_gold_candidate_names(output_name: str) -> list[str]:
    candidates = [output_name]
    if output_name.startswith("dataset_"):
        candidates.append(output_name.replace("dataset_", "gold_", 1))
    return dedupe(candidates)


def dedupe(values: list[str]) -> list[str]:
    seen = set()
    result = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result
