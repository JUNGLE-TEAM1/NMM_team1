import json
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

from app.adapters.duckdb_sql_engine import DuckDBSqlEngine
from app.services.ai_query import Week2AIQueryService
from scripts.import_product_health_handoff import CANONICAL_COLUMNS, ImportConfig, import_handoff


class InMemoryCatalogSource:
    def __init__(self, catalog: dict[str, object]) -> None:
        self.catalog = catalog

    def list_catalogs(self, tenant_id: str | None = None) -> list[dict[str, object]]:
        if tenant_id is not None and self.catalog.get("tenant_id") != tenant_id:
            return []
        return [self.catalog]


def test_product_health_handoff_import_writes_canonical_gold_and_catalog(tmp_path: Path) -> None:
    handoff_root = _write_handoff_fixture(tmp_path / "handoff")

    result = import_handoff(
        ImportConfig(
            handoff_root=handoff_root,
            output_root=tmp_path / "results" / "week2",
            archive_root=None,
        )
    )

    table = pq.ParquetFile(result.canonical_gold_path).read()
    rows = table.to_pylist()
    catalog = json.loads(result.catalog_path.read_text(encoding="utf-8"))
    run = json.loads(result.run_path.read_text(encoding="utf-8"))

    assert table.column_names == CANONICAL_COLUMNS
    assert rows[0]["product_id"] == "aph_prod_001"
    assert rows[0]["product_name"] == "Problem Skin Care Set"
    assert rows[0]["average_rating"] == 1.8
    assert rows[0]["ecommerce_product_id"] == "ec_001"
    assert rows[0]["amazon_parent_asin"] == "B001"
    assert rows[0]["match_confidence"] == 0.91
    assert catalog["contract"] == "CatalogMetadata"
    assert catalog["schema"]["schema_version"] == "schema_product_health_gold_v2"
    assert [field["name"] for field in catalog["schema"]["fields"]] == CANONICAL_COLUMNS
    assert catalog["query"]["allowed_columns"] == CANONICAL_COLUMNS
    assert "ORDER BY risk_score DESC" in catalog["query"]["canonical_demo_query"]
    assert catalog["storage"]["local_fallback_path"] == str(result.canonical_gold_path)
    assert catalog["metrics"]["input_total_bytes"] == 5_668_612_855
    assert run["run_id"] == "run_product_health_5gb_001"
    assert run["bytes"] == 5_668_612_855
    assert run["output_row_count"] == 2


def test_product_health_handoff_catalog_supports_duckdb_ai_query(tmp_path: Path) -> None:
    handoff_root = _write_handoff_fixture(tmp_path / "handoff")
    result = import_handoff(
        ImportConfig(
            handoff_root=handoff_root,
            output_root=tmp_path / "results" / "week2",
            archive_root=None,
        )
    )
    catalog = json.loads(result.catalog_path.read_text(encoding="utf-8"))
    service = Week2AIQueryService(
        sql_engine=DuckDBSqlEngine(),
        catalog_source=InMemoryCatalogSource(catalog),
    )

    answer = service.answer("위험 점수가 높은 상품 알려줘")

    assert answer.status == "succeeded"
    assert answer.route == "sql"
    assert answer.query_result.engine == "duckdb"
    assert answer.selected_datasets[0].dataset_id == "dataset_product_health_gold"
    assert answer.rows[0]["product_id"] == "aph_prod_001"
    assert answer.rows[0]["risk_score"] == 88.23
    assert answer.evidence[0].metrics["input_total_bytes"] == 5_668_612_855


def test_raw_handoff_catalog_shape_does_not_crash_ai_query(tmp_path: Path) -> None:
    handoff_root = _write_handoff_fixture(tmp_path / "handoff")
    raw_catalog = json.loads((handoff_root / "catalog" / "dataset_product_health_gold.json").read_text(encoding="utf-8"))
    raw_catalog["tenant_id"] = "tenant_demo"
    raw_catalog["name"] = "Raw Product Health Handoff"
    raw_catalog["storage"]["local_fallback_path"] = str(handoff_root / "gold" / "gold_product_health.parquet")
    service = Week2AIQueryService(
        sql_engine=DuckDBSqlEngine(),
        catalog_source=InMemoryCatalogSource(raw_catalog),
    )

    answer = service.answer("위험 점수가 높은 상품 알려줘")

    assert answer.status == "blocked"
    assert answer.route == "unsupported"
    assert "product_id" in answer.guardrail.failure_message


def _write_handoff_fixture(root: Path) -> Path:
    for directory in ["catalog", "evidence", "gold", "silver"]:
        (root / directory).mkdir(parents=True, exist_ok=True)
    (root / "README.md").write_text("# Product Health Demo Dataset Handoff\n", encoding="utf-8")
    (root / "evidence" / "raw_profile_summary.md").write_text("raw profile\n", encoding="utf-8")

    gold_rows = [
        {
            "internal_product_id": "aph_prod_001",
            "category_l1": "beauty",
            "brand": "Abbott",
            "product_title": "Problem Skin Care Set",
            "view_count": 1000,
            "purchase_count": 12,
            "conversion_rate": 0.012,
            "avg_rating": 1.8,
            "review_count": 50,
            "negative_review_rate": 0.82,
            "delivery_count": 20,
            "late_delivery_rate": 0.7,
            "risk_score": 88.23,
            "mapping_method": "synthetic_seed",
            "demo_category_label": "Beauty / Skin Care Sets",
        },
        {
            "internal_product_id": "aph_prod_002",
            "category_l1": "daily_goods",
            "brand": "Stable Brand",
            "product_title": "Stable Daily Seller",
            "view_count": 500,
            "purchase_count": 80,
            "conversion_rate": 0.16,
            "avg_rating": 4.6,
            "review_count": 44,
            "negative_review_rate": 0.04,
            "delivery_count": 30,
            "late_delivery_rate": 0.02,
            "risk_score": 9.5,
            "mapping_method": "synthetic_seed",
            "demo_category_label": "Daily Goods / Stable Sellers",
        },
    ]
    pq.write_table(pa.Table.from_pylist(gold_rows), root / "gold" / "gold_product_health.parquet")
    pq.write_table(
        pa.Table.from_pylist(
            [
                {
                    "internal_product_id": "aph_prod_001",
                    "ecommerce_product_id": "ec_001",
                    "amazon_parent_asin": "B001",
                    "mep_product_id": "mep_001",
                    "mapping_method": "synthetic_seed",
                    "mapping_confidence": 0.91,
                },
                {
                    "internal_product_id": "aph_prod_002",
                    "ecommerce_product_id": "ec_002",
                    "amazon_parent_asin": "B002",
                    "mep_product_id": "mep_002",
                    "mapping_method": "synthetic_seed",
                    "mapping_confidence": 0.89,
                },
            ]
        ),
        root / "silver" / "seed_product_mapping.parquet",
    )
    for filename in [
        "silver_user_events.parquet",
        "silver_product_reviews.parquet",
        "silver_product_catalog.parquet",
        "silver_delivery_trip_logs.parquet",
    ]:
        pq.write_table(pa.Table.from_pylist([{"internal_product_id": "aph_prod_001"}]), root / "silver" / filename)

    _write_json(
        root / "catalog" / "dataset_product_health_gold.json",
        {
            "dataset_id": "dataset_product_health_gold",
            "table_name": "gold_product_health",
            "storage": {
                "format": "parquet",
                "local_fallback_path": "data/local_sources/product_health/gold/gold_product_health.parquet",
            },
            "schema": [
                {"name": "internal_product_id", "type": "string", "nullable": False},
                {"name": "risk_score", "type": "float64", "nullable": False},
            ],
            "metrics": {"row_count": 2, "bytes": 100},
            "query": {
                "engine": "duckdb",
                "table_name": "gold_product_health",
                "default_limit": 50,
                "allowed_columns": ["internal_product_id", "risk_score"],
            },
            "lineage": {"pipeline_id": "pipeline_product_health_e2e", "run_id": "run_product_health_smoke_001"},
        },
    )
    _write_json(
        root / "catalog" / "product_health_source_handoff.json",
        {
            "version": "test",
            "tenant_id": "tenant_demo",
            "source_datasets": [
                {"source_dataset_id": "source_ecommerce_behavior_events", "role": "behavior"},
                {"source_dataset_id": "source_amazon_product_reviews", "role": "review"},
                {"source_dataset_id": "source_taxi_delivery_logs", "role": "delivery"},
            ],
        },
    )
    summary = {
        "run_id": "run_product_health_5gb_001",
        "pipeline_id": "pipeline_product_health_e2e",
        "status": "succeeded",
        "generated_at": "2026-06-30T05:00:35+00:00",
        "evidence_mode": "processed_5gb_evidence_run",
        "available_source_total_bytes": 11_080_285_895,
        "processed_input_total_bytes": 5_668_612_855,
        "input_total_bytes": 5_668_612_855,
        "sources": [
            {
                "source": "behavior",
                "source_dataset_id": "source_ecommerce_behavior_events",
                "row_count_processed": 42_448_764,
                "duration_ms": 9225,
                "bytes": 5_668_612_855,
                "processed_input_bytes": 5_668_612_855,
                "bytes_semantics": "processed_input_bytes",
            }
        ],
    }
    _write_json(root / "evidence" / "product_health_5gb_run_summary.json", summary)
    _write_json(root / "evidence" / "product_health_run_summary.json", {**summary, "run_id": "run_product_health_smoke_001"})
    return root


def _write_json(path: Path, payload: dict[str, object]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
