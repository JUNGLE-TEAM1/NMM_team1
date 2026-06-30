import re
from dataclasses import dataclass
from typing import Any

from app.domain.retrieval_index import RetrievalIndexHit
from app.ports.retrieval_index import RetrievalIndex
from app.services.catalog_metadata import catalog_allowed_columns, catalog_query_table, catalog_schema_fields
from app.services.catalog_rag_index import CatalogRetrievalIndex


@dataclass(frozen=True)
class CatalogRetrievalResult:
    catalog: dict[str, Any]
    reason_terms: list[str]
    score: int
    index_hits: list[RetrievalIndexHit]


class CatalogRetriever:
    _column_aliases = {
        "review_count": ("인기", "리뷰", "review", "reviews"),
        "product_id": ("상품", "product", "products"),
        "average_rating": ("평점", "별점", "rating", "ratings"),
        "risk_score": ("위험", "리스크", "문제", "risk", "risks", "problem"),
        "negative_review_rate": ("부정", "불만", "나쁘", "negative", "negatives"),
        "conversion_rate": ("전환", "전환율", "conversion", "conversions"),
        "late_delivery_rate": ("배송", "지연", "지연율", "late", "delivery"),
    }

    def __init__(self, retrieval_index: RetrievalIndex | None = None) -> None:
        self.retrieval_index = retrieval_index or CatalogRetrievalIndex()

    def retrieve(self, question: str, catalogs: list[dict[str, Any]]) -> CatalogRetrievalResult:
        if not catalogs:
            raise ValueError("No CatalogMetadata entries are available for AI query.")

        index_hits = self.retrieval_index.search(question, catalogs, top_k=8)
        index_scores = self._index_scores_by_dataset(index_hits)
        selected = max(
            (self._score(question, catalog) for catalog in catalogs),
            key=lambda result: (result.score + index_scores.get(str(result.catalog.get("dataset_id")), 0.0), result.score),
        )
        selected_dataset_id = str(selected.catalog.get("dataset_id"))
        return CatalogRetrievalResult(
            catalog=selected.catalog,
            reason_terms=selected.reason_terms,
            score=selected.score,
            index_hits=[hit for hit in index_hits if hit.dataset_id == selected_dataset_id],
        )

    def _index_scores_by_dataset(self, index_hits: list[RetrievalIndexHit]) -> dict[str, float]:
        scores: dict[str, float] = {}
        for hit in index_hits:
            scores[hit.dataset_id] = scores.get(hit.dataset_id, 0.0) + hit.score
        return scores

    def _score(self, question: str, catalog: dict[str, Any]) -> CatalogRetrievalResult:
        normalized_question = question.lower()
        question_tokens = self._tokens(normalized_question)
        metadata_tokens = self._metadata_tokens(catalog)
        allowed_columns = catalog_allowed_columns(catalog)
        reason_terms: list[str] = []
        score = 0

        for column, aliases in self._column_aliases.items():
            if column not in allowed_columns:
                continue
            if any(alias in normalized_question or alias in question_tokens for alias in aliases):
                reason_terms.append(column)
                score += 3

        for token in question_tokens:
            if token in metadata_tokens and token not in reason_terms:
                reason_terms.append(token)
                score += 2

        if not reason_terms:
            reason_terms = allowed_columns[:2]

        return CatalogRetrievalResult(
            catalog=catalog,
            reason_terms=reason_terms,
            score=score,
            index_hits=[],
        )

    def _metadata_tokens(self, catalog: dict[str, Any]) -> set[str]:
        lineage = catalog.get("lineage", {})
        allowed_columns = catalog_allowed_columns(catalog)
        values: list[str] = [
            str(catalog.get("dataset_id", "")),
            str(catalog.get("name", "")),
            str(catalog.get("layer", "")),
            catalog_query_table(catalog),
        ]

        values.extend(str(column) for column in allowed_columns)
        values.extend(str(field.get("name", "")) for field in catalog_schema_fields(catalog))
        values.extend(str(source_id) for source_id in lineage.get("source_ids", []))
        values.extend(str(dataset_id) for dataset_id in lineage.get("upstream_datasets", []))

        return self._tokens(" ".join(values).lower())

    def _tokens(self, text: str) -> set[str]:
        normalized = text.replace("_", " ").replace("-", " ")
        tokens = set(re.findall(r"[a-z0-9]+", normalized))
        for token in list(tokens):
            if len(token) > 3 and token.endswith("s"):
                tokens.add(token[:-1])
        return tokens
