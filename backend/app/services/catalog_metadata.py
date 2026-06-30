from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse


def catalog_query_table(catalog: dict[str, Any]) -> str:
    query = _query(catalog)
    return str(
        query.get("table_name")
        or query.get("query_table")
        or catalog.get("query_table")
        or catalog.get("table_name")
        or ""
    )


def catalog_allowed_columns(catalog: dict[str, Any]) -> list[str]:
    query = _query(catalog)
    raw_columns = query.get("allowed_columns") or catalog.get("allowed_columns") or []
    return [str(column) for column in raw_columns]


def catalog_canonical_demo_query(catalog: dict[str, Any]) -> str | None:
    query = _query(catalog)
    value = query.get("canonical_demo_query") or catalog.get("canonical_demo_query")
    return str(value) if value else None


def catalog_schema_fields(catalog: dict[str, Any]) -> list[dict[str, Any]]:
    schema = catalog.get("schema", {})
    if isinstance(schema, dict):
        fields = schema.get("fields", [])
    elif isinstance(schema, list):
        fields = schema
    else:
        fields = []
    return [field for field in fields if isinstance(field, dict)]


def catalog_local_fallback_path(catalog: dict[str, Any]) -> str | None:
    storage = catalog.get("storage", {})
    if not isinstance(storage, dict):
        storage = {}

    candidates = [
        storage.get("local_fallback_path"),
        catalog.get("local_fallback_path"),
        storage.get("storage_uri"),
        catalog.get("storage_uri"),
    ]
    for candidate in candidates:
        local_path = _local_path_from_uri(candidate)
        if local_path:
            return local_path
    return None


def _query(catalog: dict[str, Any]) -> dict[str, Any]:
    query = catalog.get("query", {})
    return query if isinstance(query, dict) else {}


def _local_path_from_uri(value: object) -> str | None:
    if not value:
        return None
    uri = str(value)
    parsed = urlparse(uri)
    if parsed.scheme == "file":
        return unquote(parsed.path)
    if parsed.scheme in {"s3", "http", "https"}:
        return None
    if parsed.scheme and len(parsed.scheme) > 1:
        return None
    return str(Path(uri))
