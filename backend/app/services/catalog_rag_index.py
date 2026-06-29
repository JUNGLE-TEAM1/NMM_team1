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
        r"(api[_-]?key|secret|credential|password|token|local_fallback_path|file://|s3://|/tmp/|\.parquet|\.jsonl)",
        re.IGNORECASE,
    )
    _column_aliases = {
        "review_count": ("인기", "리뷰", "review", "reviews"),
        "product_id": ("상품", "product", "products"),
        "average_rating": ("평점", "별점", "rating", "ratings"),
        "risk_score": ("위험", "리스크", "risk", "risks"),
        "negative_review_rate": ("부정", "불만", "negative", "negatives"),
        "conversion_rate": ("전환", "전환율", "conversion", "conversions"),
        "late_delivery_rate": ("배송", "지연", "지연율", "late", "delivery"),
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
        query = catalog.get("query", {})
        freshness = catalog.get("freshness", {})
        allowed_columns = [str(column) for column in query.get("allowed_columns", [])]
        text = " ".join(
            [
                f"dataset {dataset_id}",
                f"name {catalog.get('name', '')}",
                f"layer {catalog.get('layer', '')}",
                f"table {query.get('table_name', '')}",
                f"allowed_columns {' '.join(allowed_columns)}",
                f"default_limit {query.get('default_limit', '')}",
                f"timeout_seconds {query.get('timeout_seconds', '')}",
                f"freshness {catalog.get('updated_at', '')} {freshness.get('data_interval_end', '')}",
                self._aliases_text(allowed_columns),
            ]
        )
        return self._chunk(
            chunk_id=f"{dataset_id}:catalog",
            dataset_id=dataset_id,
            source_type="catalog",
            source_id=dataset_id,
            text=text,
        )

    def _schema_chunks(self, catalog: dict[str, Any]) -> list[RetrievalIndexChunk]:
        dataset_id = str(catalog.get("dataset_id", ""))
        dataset_name = str(catalog.get("name", ""))
        fields = catalog.get("schema", {}).get("fields", [])
        chunks: list[RetrievalIndexChunk] = []
        for field in fields:
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
            chunks.append(
                self._chunk(
                    chunk_id=f"{dataset_id}:schema:{field_name}",
                    dataset_id=dataset_id,
                    source_type="schema",
                    source_id=f"{dataset_id}.schema.{field_name}",
                    text=text,
                )
            )
        return chunks

    def _metric_chunks(self, catalog: dict[str, Any]) -> list[RetrievalIndexChunk]:
        dataset_id = str(catalog.get("dataset_id", ""))
        metrics = catalog.get("metrics", {})
        chunks: list[RetrievalIndexChunk] = []
        for metric_key, metric_value in self._flatten_metrics(metrics):
            text = " ".join(
                [
                    f"dataset {dataset_id}",
                    f"metric {metric_key}",
                    f"value {metric_value}",
                    self._aliases_text([metric_key]),
                ]
            )
            chunks.append(
                self._chunk(
                    chunk_id=f"{dataset_id}:metric:{metric_key}",
                    dataset_id=dataset_id,
                    source_type="metric",
                    source_id=f"{dataset_id}.metric.{metric_key}",
                    text=text,
                )
            )
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
                f"pipeline {pipeline_id}",
                f"run {lineage.get('run_id', '')}",
                f"sources {source_ids}",
                f"upstream {upstream_datasets}",
            ]
        )
        return self._chunk(
            chunk_id=f"{dataset_id}:lineage:{pipeline_id}",
            dataset_id=dataset_id,
            source_type="lineage",
            source_id=f"{dataset_id}.lineage.{pipeline_id}",
            text=text,
        )

    def _chunk(
        self,
        chunk_id: str,
        dataset_id: str,
        source_type: str,
        source_id: str,
        text: str,
    ) -> RetrievalIndexChunk:
        terms = tokenize_text(text)
        return RetrievalIndexChunk(
            chunk_id=chunk_id,
            dataset_id=dataset_id,
            source_type=source_type,
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
            lineage = catalog.get("lineage", {})
            records.append(
                {
                    "dataset_id": catalog.get("dataset_id"),
                    "run_id": lineage.get("run_id"),
                    "updated_at": catalog.get("updated_at"),
                }
            )
        payload = json.dumps(sorted(records, key=lambda item: str(item["dataset_id"])), sort_keys=True)
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def _load_cached_snapshot(self, signature: str) -> RetrievalIndexSnapshot | None:
        if self.persist_path is None or not self.persist_path.exists():
            return None
        try:
            payload = json.loads(self.persist_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return None
        if payload.get("signature") != signature:
            return None
        chunks = [RetrievalIndexChunk(**chunk) for chunk in payload.get("chunks", [])]
        return RetrievalIndexSnapshot(signature=signature, chunks=chunks, rebuilt=False)

    def _persist(self, snapshot: RetrievalIndexSnapshot) -> None:
        if self.persist_path is None:
            return
        self.persist_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "signature": snapshot.signature,
            "chunks": [asdict(chunk) for chunk in snapshot.chunks],
        }
        self.persist_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def _cosine(self, left: list[float], right: list[float]) -> float:
        if not left or not right:
            return 0.0
        return sum(left_value * right_value for left_value, right_value in zip(left, right))

    def _source_rank(self, source_type: str) -> int:
        return {
            "schema": 0,
            "metric": 1,
            "catalog": 2,
            "lineage": 3,
            "chunk": 4,
        }.get(source_type, 5)
