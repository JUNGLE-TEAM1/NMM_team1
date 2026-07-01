from __future__ import annotations

from dataclasses import asdict
import hashlib
import json
from pathlib import Path
import re
from typing import Any

from app.adapters.local_embedding import LocalTokenEmbeddingAdapter, tokenize_text
from app.domain.retrieval_index import RetrievalIndexChunk, RetrievalIndexHit, RetrievalIndexSnapshot
from app.ports.embedding_adapter import EmbeddingAdapter


class CatalogRetrievalIndex:
    _sensitive_pattern = re.compile(
        r"(api[_-]?key|secret|credential|password|token|local_fallback_path|local_path|file://|s3://|/tmp/|\.parquet|\.jsonl)",
        re.IGNORECASE,
    )
    _column_aliases = {
        "review_count": ("인기", "리뷰", "review", "reviews"),
        "product_id": ("상품", "product", "products"),
        "internal_product_id": ("상품", "product", "products"),
        "average_rating": ("평점", "별점", "rating", "ratings"),
        "risk_score": ("위험", "리스크", "문제", "risk", "risks", "problem"),
        "negative_review_rate": ("부정", "불만", "나쁘", "negative", "negatives"),
        "conversion_rate": ("전환", "전환율", "conversion", "conversions"),
        "late_delivery_rate": ("배송", "지연", "지연율", "late", "delivery"),
        "scenario_bucket": ("시나리오", "scenario", "bucket"),
        "risk_driver": ("위험요인", "원인", "driver"),
    }

    def __init__(
        self,
        embedding_adapter: EmbeddingAdapter | None = None,
        persist_path: Path | str | None = None,
    ) -> None:
        self.embedding_adapter = embedding_adapter or LocalTokenEmbeddingAdapter()
        self.persist_path = Path(persist_path) if persist_path is not None else None
        self._snapshot: RetrievalIndexSnapshot | None = None

    def refresh(self, catalogs: list[dict[str, Any]]) -> RetrievalIndexSnapshot:
        signature = self._signature(catalogs)
        if self._snapshot is not None and self._snapshot.signature == signature:
            return RetrievalIndexSnapshot(
                signature=self._snapshot.signature,
                chunks=self._snapshot.chunks,
                rebuilt=False,
            )

        cached_snapshot = self._load_cached_snapshot(signature)
        if cached_snapshot is not None:
            self._snapshot = cached_snapshot
            return cached_snapshot

        chunks = self._build_chunks(catalogs)
        snapshot = RetrievalIndexSnapshot(signature=signature, chunks=chunks, rebuilt=True)
        self._snapshot = snapshot
        self._persist(snapshot)
        return snapshot

    def search(
        self,
        question: str,
        catalogs: list[dict[str, Any]],
        top_k: int = 5,
    ) -> list[RetrievalIndexHit]:
        snapshot = self.refresh(catalogs)
        question_embedding = self.embedding_adapter.embed(question)
        question_terms = set(tokenize_text(question))
        hits: list[RetrievalIndexHit] = []

        for chunk in snapshot.chunks:
            score = self._cosine(question_embedding, chunk.embedding)
            matched_terms = sorted(question_terms.intersection(chunk.terms))
            if score <= 0 and not matched_terms:
                continue
            hits.append(
                RetrievalIndexHit(
                    chunk_id=chunk.chunk_id,
                    dataset_id=chunk.dataset_id,
                    source_type=chunk.source_type,
                    source_id=chunk.source_id,
                    score=round(score, 6),
                    matched_terms=matched_terms,
                )
            )

        return sorted(
            hits,
            key=lambda hit: (
                -hit.score,
                self._source_rank(hit.source_type),
                hit.dataset_id,
                hit.source_id,
            ),
        )[:top_k]

    def _build_chunks(self, catalogs: list[dict[str, Any]]) -> list[RetrievalIndexChunk]:
        chunks: list[RetrievalIndexChunk] = []
        for catalog in catalogs:
            chunks.append(self._catalog_chunk(catalog))
            chunks.extend(self._schema_chunks(catalog))
            chunks.extend(self._metric_chunks(catalog))
            chunks.append(self._lineage_chunk(catalog))
        return chunks

    def _catalog_chunk(self, catalog: dict[str, Any]) -> RetrievalIndexChunk:
        dataset_id = str(catalog.get("dataset_id", ""))
        freshness = catalog.get("freshness", {})
        allowed_columns = self._allowed_columns(catalog)
        text = " ".join(
            [
                f"dataset {dataset_id}",
                f"name {catalog.get('name', '')}",
                f"layer {catalog.get('layer', '')}",
                f"table {self._query_table(catalog)}",
                f"allowed_columns {' '.join(allowed_columns)}",
                f"default_limit {self._query_setting(catalog, 'default_limit')}",
                f"timeout_seconds {self._query_setting(catalog, 'timeout_seconds')}",
                f"freshness {catalog.get('updated_at', '')} {freshness.get('data_interval_end', '')}",
                self._aliases_text(allowed_columns),
            ]
        )
        return self._chunk(dataset_id, "catalog", dataset_id, text)

    def _schema_chunks(self, catalog: dict[str, Any]) -> list[RetrievalIndexChunk]:
        dataset_id = str(catalog.get("dataset_id", ""))
        dataset_name = str(catalog.get("name", ""))
        chunks: list[RetrievalIndexChunk] = []
        for field in self._schema_fields(catalog):
            field_name = str(field.get("name", ""))
            text = " ".join(
                [
                    f"dataset {dataset_id}",
                    f"name {dataset_name}",
                    f"schema field {field_name}",
                    f"type {field.get('type', '')}",
                    f"nullable {field.get('nullable', '')}",
                    self._aliases_text([field_name]),
                ]
            )
            chunks.append(self._chunk(dataset_id, "schema", f"{dataset_id}.schema.{field_name}", text))
        return chunks

    def _metric_chunks(self, catalog: dict[str, Any]) -> list[RetrievalIndexChunk]:
        dataset_id = str(catalog.get("dataset_id", ""))
        chunks: list[RetrievalIndexChunk] = []
        for metric_key, metric_value in self._flatten_metrics(catalog.get("metrics", {})):
            text = " ".join(
                [
                    f"dataset {dataset_id}",
                    f"metric {metric_key}",
                    f"value {metric_value}",
                    self._aliases_text([metric_key]),
                ]
            )
            chunks.append(self._chunk(dataset_id, "metric", f"{dataset_id}.metric.{metric_key}", text))
        return chunks

    def _lineage_chunk(self, catalog: dict[str, Any]) -> RetrievalIndexChunk:
        dataset_id = str(catalog.get("dataset_id", ""))
        lineage = catalog.get("lineage", {})
        pipeline_id = str(lineage.get("pipeline_id", "lineage"))
        source_ids = " ".join(str(source_id) for source_id in lineage.get("source_ids", []))
        upstream_datasets = " ".join(str(dataset_id) for dataset_id in lineage.get("upstream_datasets", []))
        text = " ".join(
            [
                f"dataset {dataset_id}",
                "lineage",
                f"pipeline {pipeline_id}",
                f"run {lineage.get('run_id', '')}",
                f"sources {source_ids}",
                f"upstream {upstream_datasets}",
            ]
        )
        return self._chunk(dataset_id, "lineage", f"{dataset_id}.lineage.{pipeline_id}", text)

    def _chunk(
        self,
        dataset_id: str,
        source_type: str,
        source_id: str,
        text: str,
    ) -> RetrievalIndexChunk:
        terms = tokenize_text(text)
        return RetrievalIndexChunk(
            chunk_id=f"{source_id}:{source_type}",
            dataset_id=dataset_id,
            source_type=source_type,  # type: ignore[arg-type]
            source_id=source_id,
            text=text,
            terms=terms,
            embedding=self.embedding_adapter.embed(text),
        )

    def _aliases_text(self, keys: list[str]) -> str:
        aliases: list[str] = []
        for key in keys:
            aliases.extend(self._column_aliases.get(key, ()))
        return "aliases " + " ".join(aliases)

    def _flatten_metrics(self, metrics: dict[str, Any]) -> list[tuple[str, str]]:
        flattened: list[tuple[str, str]] = []

        def visit(prefix: str, value: Any) -> None:
            if isinstance(value, dict):
                for nested_key, nested_value in value.items():
                    next_prefix = f"{prefix}.{nested_key}" if prefix else str(nested_key)
                    visit(next_prefix, nested_value)
                return
            if isinstance(value, (str, int, float, bool)) or value is None:
                string_value = str(value)
                if self._is_safe_scalar(prefix, string_value):
                    flattened.append((prefix, string_value))

        visit("", metrics)
        return flattened

    def _is_safe_scalar(self, key: str, value: str) -> bool:
        return self._sensitive_pattern.search(key) is None and self._sensitive_pattern.search(value) is None

    def _signature(self, catalogs: list[dict[str, Any]]) -> str:
        records = []
        for catalog in catalogs:
            records.append(
                {
                    "dataset_id": catalog.get("dataset_id"),
                    "updated_at": catalog.get("updated_at"),
                    "schema": catalog.get("schema"),
                    "metrics": catalog.get("metrics"),
                    "lineage": catalog.get("lineage"),
                    "query": catalog.get("query"),
                }
            )
        payload = json.dumps(records, sort_keys=True, ensure_ascii=False, default=str)
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def _persist(self, snapshot: RetrievalIndexSnapshot) -> None:
        if self.persist_path is None:
            return
        self.persist_path.parent.mkdir(parents=True, exist_ok=True)
        self.persist_path.write_text(
            json.dumps(
                {
                    "signature": snapshot.signature,
                    "chunks": [asdict(chunk) for chunk in snapshot.chunks],
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

    def _load_cached_snapshot(self, signature: str) -> RetrievalIndexSnapshot | None:
        if self.persist_path is None or not self.persist_path.exists():
            return None
        try:
            payload = json.loads(self.persist_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None
        if payload.get("signature") != signature:
            return None
        chunks = [
            RetrievalIndexChunk(
                chunk_id=str(chunk["chunk_id"]),
                dataset_id=str(chunk["dataset_id"]),
                source_type=chunk["source_type"],
                source_id=str(chunk["source_id"]),
                text=str(chunk["text"]),
                terms=list(chunk.get("terms", [])),
                embedding=list(chunk.get("embedding", [])),
                metadata=dict(chunk.get("metadata", {})),
            )
            for chunk in payload.get("chunks", [])
            if isinstance(chunk, dict)
        ]
        return RetrievalIndexSnapshot(signature=signature, chunks=chunks, rebuilt=False)

    def _cosine(self, left: list[float], right: list[float]) -> float:
        if not left or not right or len(left) != len(right):
            return 0.0
        return sum(a * b for a, b in zip(left, right))

    def _source_rank(self, source_type: str) -> int:
        ranks = {"catalog": 0, "schema": 1, "metric": 2, "lineage": 3, "chunk": 4}
        return ranks.get(source_type, 99)

    def _schema_fields(self, catalog: dict[str, Any]) -> list[dict[str, Any]]:
        schema = catalog.get("schema", {})
        if isinstance(schema, dict):
            fields = schema.get("fields", [])
            if isinstance(fields, list):
                return [field for field in fields if isinstance(field, dict)]
        if isinstance(schema, list):
            return [field for field in schema if isinstance(field, dict)]
        return []

    def _allowed_columns(self, catalog: dict[str, Any]) -> list[str]:
        query = catalog.get("query", {})
        if isinstance(query, dict) and isinstance(query.get("allowed_columns"), list):
            return [str(column) for column in query["allowed_columns"]]
        return [str(field.get("name")) for field in self._schema_fields(catalog) if field.get("name")]

    def _query_table(self, catalog: dict[str, Any]) -> str:
        query = catalog.get("query", {})
        if isinstance(query, dict) and query.get("table_name"):
            return str(query["table_name"])
        return str(catalog.get("dataset_id", ""))

    def _query_setting(self, catalog: dict[str, Any], key: str) -> str:
        query = catalog.get("query", {})
        if isinstance(query, dict) and query.get(key) is not None:
            return str(query[key])
        if catalog.get(key) is not None:
            return str(catalog[key])
        return ""
