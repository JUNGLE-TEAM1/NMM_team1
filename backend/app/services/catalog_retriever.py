import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class CatalogRetrievalResult:
    catalog: dict[str, Any]
    reason_terms: list[str]
    score: int


class CatalogRetriever:
    _column_aliases = {
        "review_count": ("인기", "리뷰", "review", "reviews"),
        "product_id": ("상품", "product", "products"),
        "average_rating": ("평점", "별점", "rating", "ratings"),
        "risk_score": ("위험", "리스크", "risk", "risks"),
        "negative_review_rate": ("부정", "불만", "negative", "negatives"),
        "conversion_rate": ("전환", "전환율", "conversion", "conversions"),
        "late_delivery_rate": ("배송", "지연", "지연율", "late", "delivery"),
    }

    def retrieve(self, question: str, catalogs: list[dict[str, Any]]) -> CatalogRetrievalResult:
        if not catalogs:
            raise ValueError("No CatalogMetadata entries are available for AI query.")

        return max((self._score(question, catalog) for catalog in catalogs), key=lambda result: result.score)

    def _score(self, question: str, catalog: dict[str, Any]) -> CatalogRetrievalResult:
        normalized_question = question.lower()
        question_tokens = self._tokens(normalized_question)
        metadata_tokens = self._metadata_tokens(catalog)
        allowed_columns = catalog["query"]["allowed_columns"]
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
        )

    def _metadata_tokens(self, catalog: dict[str, Any]) -> set[str]:
        schema_fields = catalog.get("schema", {}).get("fields", [])
        lineage = catalog.get("lineage", {})
        query = catalog.get("query", {})
        values: list[str] = [
            str(catalog.get("dataset_id", "")),
            str(catalog.get("name", "")),
            str(catalog.get("layer", "")),
            str(query.get("table_name", "")),
        ]

        values.extend(str(column) for column in query.get("allowed_columns", []))
        values.extend(str(field.get("name", "")) for field in schema_fields)
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
