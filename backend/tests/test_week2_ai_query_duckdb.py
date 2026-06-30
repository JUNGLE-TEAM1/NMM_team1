import tempfile
from pathlib import Path

from fastapi.testclient import TestClient
import pyarrow as pa
import pyarrow.parquet as pq

from app.adapters.duckdb_sql_engine import DuckDBSqlEngine
from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.adapters.week2_catalog_store_source import Week2CatalogStoreSource
from app.core.app_factory import create_app
from app.core.settings import Settings
from app.services.ai_query import Week2AIQueryService
from app.services.week2_catalog_store import Week2CatalogStore


PRODUCT_HEALTH_ALLOWED_COLUMNS = [
    "product_id",
    "product_name",
    "normalized_brand",
    "unified_category",
    "ecommerce_product_id",
    "amazon_parent_asin",
    "risk_score",
    "negative_review_rate",
    "conversion_rate",
    "late_delivery_rate",
]


def test_week2_ai_query_can_use_duckdb_runtime_after_local_runner_output() -> None:
    temp_dir = tempfile.TemporaryDirectory()
    settings = Settings(
        metadata_url=f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}",
        result_store_path=str(Path(temp_dir.name) / "results"),
        week2_sql_engine="duckdb",
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    app.state.test_temp_dir = temp_dir
    client = TestClient(app)

    run_response = client.post(
        "/api/week2/workflows/pipeline_reviews_json_e2e/runs",
        json={"executor": "local_runner", "triggered_by": "m2_owner"},
    )
    query_response = client.post(
        "/api/week2/ai/query",
        json={"question": "리뷰가 가장 많은 상품 알려줘"},
    )

    assert run_response.status_code == 201
    assert query_response.status_code == 200
    payload = query_response.json()
    assert payload["status"] == "succeeded"
    assert payload["query_result"]["engine"] == "duckdb"
    assert payload["query_result"]["rows"][0] == {
        "product_id": "B001",
        "review_count": 2,
        "average_rating": 4.5,
    }


def test_week2_ai_query_uses_stored_product_health_catalog_storage_uri_for_duckdb(tmp_path: Path) -> None:
    parquet_path = tmp_path / "gold_product_health.parquet"
    table = pa.table(
        {
            "product_id": ["ph_safe", "ph_risky"],
            "product_name": ["Stable Product", "Risky Product"],
            "normalized_brand": ["acme", "omni"],
            "unified_category": ["home", "electronics"],
            "ecommerce_product_id": ["ecom-1", "ecom-2"],
            "amazon_parent_asin": ["ASINSAFE", "ASINRISK"],
            "risk_score": [18.2, 91.7],
            "negative_review_rate": [0.02, 0.41],
            "conversion_rate": [0.19, 0.03],
            "late_delivery_rate": [0.01, 0.28],
        }
    )
    pq.write_table(table, parquet_path)
    catalog = {
        "contract": "CatalogMetadata",
        "tenant_id": "tenant_demo",
        "dataset_id": "dataset_product_health_gold",
        "name": "Product Health Gold",
        "s3_uri": "s3://asklake-demo/product_health/gold/run_id=run_product_health_001/",
        "storage_uri": str(parquet_path),
        "query_table": "gold_product_health",
        "allowed_columns": PRODUCT_HEALTH_ALLOWED_COLUMNS,
        "canonical_demo_query": (
            "SELECT product_id, product_name, normalized_brand, unified_category, "
            "ecommerce_product_id, amazon_parent_asin, risk_score, negative_review_rate, "
            "conversion_rate, late_delivery_rate FROM gold_product_health "
            "ORDER BY risk_score DESC LIMIT 10"
        ),
        "schema": {
            "fields": [
                {"name": column, "type": "number" if column.endswith("_rate") or column == "risk_score" else "string"}
                for column in PRODUCT_HEALTH_ALLOWED_COLUMNS
            ]
        },
        "metrics": {"row_count": 2, "bytes": parquet_path.stat().st_size, "quality": {"schema_match": "passed"}},
        "lineage": {"pipeline_id": "pipeline_product_health_e2e", "run_id": "run_product_health_001"},
        "updated_at": "2026-06-30T10:00:00+09:00",
    }
    catalog_store = Week2CatalogStore(tmp_path / "_metadata")
    catalog_store.save_catalog(catalog)
    service = Week2AIQueryService(
        sql_engine=DuckDBSqlEngine(),
        catalog_source=Week2CatalogStoreSource(catalog_store),
    )

    result = service.answer("위험 점수가 높은 상품 알려줘")

    assert result.status == "succeeded"
    assert result.selected_datasets[0].dataset_id == "dataset_product_health_gold"
    assert result.sql == catalog["canonical_demo_query"]
    assert result.query_result.engine == "duckdb"
    assert result.query_result.rows[0]["product_id"] == "ph_risky"
    assert result.query_result.rows[0]["risk_score"] == 91.7
    assert result.evidence[0].dataset_id == "dataset_product_health_gold"
    assert result.evidence[0].table_name == "gold_product_health"
    assert result.evidence[0].lineage["run_id"] == "run_product_health_001"
