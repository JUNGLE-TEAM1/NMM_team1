from copy import deepcopy
import json

from app.adapters.local_embedding import LocalTokenEmbeddingAdapter
from app.services.catalog_rag_index import CatalogRetrievalIndex


def _review_catalog() -> dict[str, object]:
    return {
        "tenant_id": "tenant_demo",
        "dataset_id": "dataset_reviews_gold",
        "name": "Amazon Reviews Gold",
        "s3_uri": "s3://asklake-demo/reviews/gold/run_id=run_reviews_001/",
        "storage": {
            "local_fallback_path": "/tmp/private/reviews/run_reviews_001/reviews_gold.parquet",
        },
        "schema": {
            "fields": [
                {"name": "product_id", "type": "string", "nullable": False},
                {"name": "review_count", "type": "integer", "nullable": False},
                {"name": "average_rating", "type": "number", "nullable": True},
            ]
        },
        "metrics": {"row_count": 3, "bytes": 268, "quality": {"schema_match": "passed"}},
        "lineage": {
            "pipeline_id": "pipeline_reviews_json_e2e",
            "run_id": "run_reviews_001",
            "source_ids": ["source_reviews_seed"],
            "upstream_datasets": ["dataset_reviews_silver"],
        },
        "query": {
            "table_name": "reviews_gold",
            "allowed_columns": ["product_id", "review_count", "average_rating"],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "updated_at": "2026-06-28T10:00:00+09:00",
    }


def _product_health_catalog() -> dict[str, object]:
    return {
        "tenant_id": "tenant_demo",
        "dataset_id": "dataset_product_health_gold",
        "name": "Product Health Gold",
        "s3_uri": "s3://asklake-demo/product_health/gold/run_id=run_product_health_001/",
        "storage": {
            "local_fallback_path": "/tmp/private/product_health/run_product_health_001/gold_product_health.parquet",
        },
        "schema": {
            "fields": [
                {"name": "product_id", "type": "string", "nullable": False},
                {"name": "category", "type": "string", "nullable": True},
                {"name": "risk_score", "type": "number", "nullable": False},
                {"name": "negative_review_rate", "type": "number", "nullable": True},
                {"name": "conversion_rate", "type": "number", "nullable": True},
                {"name": "late_delivery_rate", "type": "number", "nullable": True},
            ]
        },
        "metrics": {
            "row_count": 4,
            "bytes": 512,
            "quality": {"schema_match": "passed", "row_count_checked": True},
            "semantics": {"risk_score": "weighted product health risk"},
        },
        "lineage": {
            "pipeline_id": "pipeline_product_health_e2e",
            "run_id": "run_product_health_001",
            "source_ids": [
                "source_reviews_seed",
                "source_behavior_events_seed",
                "source_delivery_trips_seed",
            ],
            "upstream_datasets": ["dataset_product_health_silver"],
        },
        "query": {
            "table_name": "gold_product_health",
            "allowed_columns": [
                "product_id",
                "category",
                "risk_score",
                "negative_review_rate",
                "conversion_rate",
                "late_delivery_rate",
            ],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "freshness": {"data_interval_end": "2026-06-28T00:00:00+09:00"},
        "updated_at": "2026-06-28T10:00:00+09:00",
    }


def test_catalog_rag_index_builds_safe_metadata_chunks() -> None:
    index = CatalogRetrievalIndex(embedding_adapter=LocalTokenEmbeddingAdapter())
    catalog = _product_health_catalog()
    catalog["metrics"]["debug_secret"] = "sk-test-do-not-index"
    catalog["metrics"]["debug_path"] = "/tmp/private/product_health/run_product_health_001/gold_product_health.parquet"

    snapshot = index.refresh([catalog])

    chunk_text = "\n".join(chunk.text for chunk in snapshot.chunks)
    assert snapshot.rebuilt is True
    assert "Product Health Gold" in chunk_text
    assert "risk_score" in chunk_text
    assert "pipeline_product_health_e2e" in chunk_text
    assert "gold_product_health" in chunk_text
    assert "default_limit 100" in chunk_text
    assert "timeout_seconds 30" in chunk_text
    assert "local_fallback_path" not in chunk_text
    assert "gold_product_health.parquet" not in chunk_text
    assert "sk-test-do-not-index" not in chunk_text
    assert any(
        chunk.source_type == "schema"
        and chunk.source_id == "dataset_product_health_gold.schema.risk_score"
        for chunk in snapshot.chunks
    )


def test_catalog_rag_index_search_prefers_relevant_catalog_chunks() -> None:
    index = CatalogRetrievalIndex(embedding_adapter=LocalTokenEmbeddingAdapter())

    hits = index.search(
        "위험 점수가 높은 상품 알려줘",
        [_review_catalog(), _product_health_catalog()],
        top_k=4,
    )

    assert hits
    assert hits[0].dataset_id == "dataset_product_health_gold"
    assert hits[0].score > 0
    assert any(
        hit.source_type == "schema"
        and hit.source_id == "dataset_product_health_gold.schema.risk_score"
        for hit in hits
    )
    assert any(term in {"위험", "risk_score"} for term in hits[0].matched_terms)


def test_catalog_rag_index_persisted_cache_rebuilds_when_catalog_signature_changes(tmp_path) -> None:
    persist_path = tmp_path / "m6_catalog_rag_index.json"
    catalog = _product_health_catalog()
    index = CatalogRetrievalIndex(
        embedding_adapter=LocalTokenEmbeddingAdapter(),
        persist_path=persist_path,
    )

    first_snapshot = index.refresh([catalog])
    cached_snapshot = index.refresh([catalog])
    changed_catalog = deepcopy(catalog)
    changed_catalog["lineage"]["run_id"] = "run_product_health_002"
    changed_catalog["updated_at"] = "2026-06-28T11:00:00+09:00"
    stale_snapshot = index.refresh([changed_catalog])

    assert first_snapshot.rebuilt is True
    assert cached_snapshot.rebuilt is False
    assert stale_snapshot.rebuilt is True
    assert stale_snapshot.signature != first_snapshot.signature
    payload = json.loads(persist_path.read_text(encoding="utf-8"))
    assert payload["signature"] == stale_snapshot.signature
