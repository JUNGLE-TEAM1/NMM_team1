import json

from app.adapters.local_embedding import LocalTokenEmbeddingAdapter
from app.services.catalog_rag_index import CatalogRetrievalIndex


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
                {"name": "internal_product_id", "type": "string", "nullable": False},
                {"name": "risk_score", "type": "number", "nullable": False},
                {"name": "negative_review_rate", "type": "number", "nullable": True},
                {"name": "conversion_rate", "type": "number", "nullable": True},
                {"name": "late_delivery_rate", "type": "number", "nullable": True},
            ]
        },
        "metrics": {
            "row_count": 1000,
            "bytes": 512,
            "processed_input_total_bytes": 5 * 1024**3,
            "quality": {"schema_match": "passed"},
            "semantics": {"risk_score": "weighted product health risk"},
        },
        "lineage": {
            "pipeline_id": "pipeline_product_health_e2e",
            "run_id": "run_product_health_001",
            "source_ids": ["source_reviews_seed", "source_behavior_events_seed"],
            "upstream_datasets": ["dataset_product_health_silver"],
        },
        "query": {
            "table_name": "gold_product_health",
            "allowed_columns": [
                "internal_product_id",
                "risk_score",
                "negative_review_rate",
                "conversion_rate",
                "late_delivery_rate",
            ],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "updated_at": "2026-06-28T10:00:00+09:00",
    }


def test_catalog_rag_index_builds_safe_metadata_chunks() -> None:
    index = CatalogRetrievalIndex(embedding_adapter=LocalTokenEmbeddingAdapter())
    catalog = _product_health_catalog()
    catalog["metrics"]["debug_secret"] = "sk-test-do-not-index"  # type: ignore[index]
    catalog["metrics"]["debug_path"] = "/tmp/private/product_health/gold_product_health.parquet"  # type: ignore[index]

    snapshot = index.refresh([catalog])

    chunk_text = "\n".join(chunk.text for chunk in snapshot.chunks)
    assert snapshot.rebuilt is True
    assert "Product Health Gold" in chunk_text
    assert "risk_score" in chunk_text
    assert "pipeline_product_health_e2e" in chunk_text
    assert "gold_product_health" in chunk_text
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

    hits = index.search("위험 점수가 높은 상품 알려줘", [_product_health_catalog()], top_k=4)

    assert hits
    assert hits[0].dataset_id == "dataset_product_health_gold"
    assert hits[0].score > 0
    assert any(
        hit.source_type == "schema"
        and hit.source_id == "dataset_product_health_gold.schema.risk_score"
        for hit in hits
    )


def test_catalog_rag_index_persisted_cache_rebuilds_when_catalog_signature_changes(tmp_path) -> None:
    persist_path = tmp_path / "m6_catalog_rag_index.json"
    catalog = _product_health_catalog()
    index = CatalogRetrievalIndex(embedding_adapter=LocalTokenEmbeddingAdapter(), persist_path=persist_path)

    first_snapshot = index.refresh([catalog])
    cached_snapshot = index.refresh([catalog])
    changed_catalog = _product_health_catalog()
    changed_catalog["lineage"]["run_id"] = "run_product_health_002"  # type: ignore[index]
    changed_catalog["updated_at"] = "2026-06-28T11:00:00+09:00"
    stale_snapshot = index.refresh([changed_catalog])

    assert first_snapshot.rebuilt is True
    assert cached_snapshot.rebuilt is False
    assert stale_snapshot.rebuilt is True
    assert stale_snapshot.signature != first_snapshot.signature
    payload = json.loads(persist_path.read_text(encoding="utf-8"))
    assert payload["signature"] == stale_snapshot.signature
