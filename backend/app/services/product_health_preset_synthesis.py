from __future__ import annotations

import importlib.util
import io
from contextlib import redirect_stdout
from pathlib import Path
from types import ModuleType

import pyarrow.parquet as pq

from app.domain.schemas import ProductHealthPresetArtifact, ProductHealthPresetSynthesisResult
from app.services.product_health_source_inventory import ROOT


SCRIPT_PATH = Path("scripts/product_health_synthetic_smoke.py")
SILVER = ROOT / "silver"
GOLD = ROOT / "gold"
CATALOG = ROOT / "catalog"
EVIDENCE = ROOT / "evidence"


class ProductHealthPresetSynthesisService:
    def run(self) -> ProductHealthPresetSynthesisResult:
        module = load_synthesis_module(SCRIPT_PATH)
        captured = io.StringIO()
        try:
            with redirect_stdout(captured):
                module.main()
        except Exception as error:  # pragma: no cover - exercised by API error path if script breaks.
            raise ProductHealthPresetSynthesisError(f"Product Health preset synthesis failed: {error}") from error

        run_summary = read_json(EVIDENCE / "product_health_run_summary.json")
        gold_artifact = parquet_artifact("gold_product_health", GOLD / "gold_product_health.parquet")
        artifacts = [
            parquet_artifact("silver_user_events", SILVER / "silver_user_events.parquet"),
            parquet_artifact("silver_product_reviews", SILVER / "silver_product_reviews.parquet"),
            parquet_artifact("silver_product_catalog", SILVER / "silver_product_catalog.parquet"),
            parquet_artifact("silver_delivery_trip_logs", SILVER / "silver_delivery_trip_logs.parquet"),
            parquet_artifact("seed_product_mapping", SILVER / "seed_product_mapping.parquet"),
            gold_artifact,
            json_artifact("catalog_handoff", CATALOG / "dataset_product_health_gold.json"),
            json_artifact("source_handoff", CATALOG / "product_health_source_handoff.json"),
            json_artifact("run_summary", EVIDENCE / "product_health_run_summary.json"),
        ]
        return ProductHealthPresetSynthesisResult(
            status="succeeded",
            mode=str(run_summary.get("evidence_mode") or run_summary.get("mode") or "smoke"),
            run_id=str(run_summary.get("run_id") or "run_product_health_smoke_001"),
            generated_at=run_summary.get("generated_at"),
            gold_output=gold_artifact,
            artifacts=artifacts,
            sql_smoke=run_summary.get("sql_smoke", {}),
            message="Product Health preset synthesis completed. Prepared Silver/Gold/Catalog evidence was regenerated.",
        )


class ProductHealthPresetSynthesisError(RuntimeError):
    pass


def load_synthesis_module(script_path: Path) -> ModuleType:
    if not script_path.exists():
        raise ProductHealthPresetSynthesisError(f"Product Health synthesis script not found: {script_path}")
    spec = importlib.util.spec_from_file_location("product_health_synthetic_smoke_runtime", script_path)
    if spec is None or spec.loader is None:
        raise ProductHealthPresetSynthesisError(f"Product Health synthesis script cannot be loaded: {script_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def parquet_artifact(role: str, path: Path) -> ProductHealthPresetArtifact:
    if not path.exists():
        return ProductHealthPresetArtifact(role=role, path=str(path), format="parquet", status="missing")
    parquet_file = pq.ParquetFile(path)
    row_count = parquet_file.metadata.num_rows if parquet_file.metadata else None
    return ProductHealthPresetArtifact(
        role=role,
        path=str(path),
        row_count=row_count,
        bytes=path.stat().st_size,
        format="parquet",
    )


def json_artifact(role: str, path: Path) -> ProductHealthPresetArtifact:
    if not path.exists():
        return ProductHealthPresetArtifact(role=role, path=str(path), format="json", status="missing")
    return ProductHealthPresetArtifact(
        role=role,
        path=str(path),
        bytes=path.stat().st_size,
        format="json",
    )


def read_json(path: Path) -> dict[str, object]:
    if not path.exists():
        raise ProductHealthPresetSynthesisError(f"Product Health run summary not found after synthesis: {path}")
    import json

    return json.loads(path.read_text(encoding="utf-8"))
