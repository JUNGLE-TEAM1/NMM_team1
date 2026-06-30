from __future__ import annotations

import json
import math
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path
from time import perf_counter
from typing import Any
from urllib.parse import unquote, urlparse

from app.services.product_health_manual_run_contract import ProductHealthManualRunContractService
from app.services.week2_local_runner import elapsed_ms, path_size, repo_root


PRODUCT_HEALTH_PIPELINE_ID = "pipeline_product_health_e2e"
PRODUCT_HEALTH_DATASET_ID = "dataset_product_health_gold"
PRODUCT_HEALTH_QUERY_TABLE = "gold_product_health"
PRODUCT_HEALTH_SUCCEEDED = "succeeded_product_health_execution"
PRODUCT_HEALTH_FAILED = "failed_product_health_execution"
SOURCE_SNAPSHOT_READY = "ready"
SOURCE_SNAPSHOT_MISSING = "missing_source_snapshot"
SOURCE_SNAPSHOT_INVALID = "invalid_source_snapshot"
SUPPORTED_SNAPSHOT_FORMAT = "parquet"
RISK_WEIGHTS = {
    "negative_review_rate": 0.35,
    "low_rating_score": 0.30,
    "low_conversion_score": 0.20,
    "late_delivery_rate": 0.15,
}


class ProductHealthManualRunExecutionService:
    """Product Health Target Dataset Manual Run을 snapshot artifact 기반으로 실행한다."""

    def __init__(
        self,
        output_root: Path | None = None,
        contract_service: ProductHealthManualRunContractService | None = None,
    ) -> None:
        self.output_root = output_root or repo_root() / "data" / "week2"
        self.contract_service = contract_service or ProductHealthManualRunContractService()

    def run(
        self,
        *,
        target_dataset: dict[str, Any],
        source_snapshots: list[dict[str, Any]],
        executor: str,
        triggered_by: str,
    ) -> dict[str, Any]:
        started = perf_counter()
        run_id = product_health_run_id()
        timestamp = now_iso()
        execution_result = base_execution_result(
            run_id=run_id,
            executor=executor,
            triggered_by=triggered_by,
            timestamp=timestamp,
        )
        contract = self.contract_service.build_contract(
            execution_result=execution_result,
            target_dataset=target_dataset,
        )

        try:
            source_context = self._resolve_source_snapshots(target_dataset, source_snapshots, contract)
            rows_by_role, read_tasks = self._read_snapshot_rows(source_context, contract)
            gold_rows = build_gold_rows(rows_by_role, contract["gold_output"]["schema"])
            output_path = self._output_path(run_id)
            write_gold_parquet(gold_rows, contract["gold_output"]["schema"], output_path)
            output_bytes = path_size(output_path) or 0
            quality_results = evaluate_quality_results(
                contract["quality_results"],
                gold_rows,
                contract["gold_output"]["schema"],
            )
            status = "succeeded" if all(result["status"] == "passed" for result in quality_results) else "failed"
            contract_status = PRODUCT_HEALTH_SUCCEEDED if status == "succeeded" else PRODUCT_HEALTH_FAILED
            contract = completed_contract(
                contract=contract,
                source_context=source_context,
                output_path=output_path,
                output_bytes=output_bytes,
                gold_rows=gold_rows,
                quality_results=quality_results,
                run_id=run_id,
                status=contract_status,
            )
            execution_result.update(
                {
                    "status": status,
                    "row_count": sum(item["row_count"] for item in source_context),
                    "bytes": sum(item["bytes"] for item in source_context),
                    "duration_ms": elapsed_ms(started),
                    "outputs": [
                        {
                            "dataset_id": contract["gold_output"]["dataset_id"],
                            "table_name": contract["gold_output"]["query_table"],
                            "format": "parquet",
                            "uri": contract["gold_output"]["storage_uri"],
                            "local_fallback_path": str(output_path),
                            "row_count": len(gold_rows),
                            "bytes": output_bytes,
                        }
                    ],
                    "output_row_count": len(gold_rows),
                    "output_bytes": output_bytes,
                    "task_results": read_tasks
                    + [
                        succeeded_task_result(
                            "product_health_transform",
                            row_count=len(gold_rows),
                            bytes=None,
                            transform_version=contract["gold_output"]["contract_version"],
                        ),
                        succeeded_task_result(
                            "product_health_write_gold",
                            row_count=len(gold_rows),
                            bytes=output_bytes,
                            output_path=str(output_path),
                        ),
                    ]
                    + quality_task_results(quality_results),
                    "logs": [
                        {"level": "info", "message": "queued"},
                        {"level": "info", "message": "running"},
                        {"level": "info", "message": "product_health manual run completed"},
                    ],
                }
            )
        except ProductHealthExecutionError as error:
            contract = failed_contract(contract, error)
            execution_result.update(
                {
                    "status": "failed",
                    "row_count": None,
                    "bytes": None,
                    "duration_ms": elapsed_ms(started),
                    "outputs": [],
                    "output_row_count": None,
                    "output_bytes": None,
                    "task_results": [failed_task_result(error.node_id, error.message, **error.details)],
                    "logs": [
                        {"level": "info", "message": "queued"},
                        {"level": "info", "message": "running"},
                        {"level": "error", "message": error.message},
                    ],
                }
            )

        execution_result["timestamps"]["finished_at"] = now_iso()
        execution_result["product_health_manual_run_contract"] = contract
        return execution_result

    def _resolve_source_snapshots(
        self,
        target_dataset: dict[str, Any],
        source_snapshots: list[dict[str, Any]],
        contract: dict[str, Any],
    ) -> list[dict[str, Any]]:
        source_mappings = target_dataset.get("source_mappings") or []
        if not source_mappings:
            raise ProductHealthExecutionError(
                "source_snapshot_lookup",
                "Product Health Target Dataset requires source_mappings before execution.",
                code="MISSING_SOURCE_MAPPING",
            )

        snapshots_by_source_dataset = {
            snapshot["source_dataset_id"]: snapshot for snapshot in source_snapshots if snapshot.get("source_dataset_id")
        }
        context: list[dict[str, Any]] = []
        missing: list[dict[str, Any]] = []
        for mapping in source_mappings:
            source_dataset_id = mapping.get("source_dataset_id")
            snapshot = snapshots_by_source_dataset.get(source_dataset_id)
            if snapshot is None:
                missing.append(mapping)
                continue
            artifact_path = artifact_uri_to_path(str(snapshot.get("artifact_uri", "")))
            if snapshot.get("format") != SUPPORTED_SNAPSHOT_FORMAT:
                raise ProductHealthExecutionError(
                    "source_snapshot_lookup",
                    f"Unsupported source snapshot format for {source_dataset_id}: {snapshot.get('format')}",
                    code="UNSUPPORTED_SOURCE_SNAPSHOT_FORMAT",
                    source_dataset_id=source_dataset_id,
                    role=mapping.get("role"),
                )
            if not artifact_path.exists():
                raise ProductHealthExecutionError(
                    "source_snapshot_lookup",
                    f"Source snapshot artifact not found: {artifact_path}",
                    code="SOURCE_SNAPSHOT_ARTIFACT_NOT_FOUND",
                    source_dataset_id=source_dataset_id,
                    role=mapping.get("role"),
                    artifact_uri=snapshot.get("artifact_uri"),
                )
            context.append(
                {
                    "mapping": mapping,
                    "snapshot": snapshot,
                    "artifact_path": artifact_path,
                    "role": mapping.get("role"),
                    "source_id": mapping.get("source_id"),
                    "source_dataset_id": source_dataset_id,
                    "snapshot_id": snapshot.get("snapshot_id"),
                    "row_count": int(snapshot.get("row_count") or 0),
                    "bytes": int(snapshot.get("bytes") or 0),
                }
            )

        apply_snapshot_context(contract, context, missing)
        if missing:
            raise ProductHealthExecutionError(
                "source_snapshot_lookup",
                "Product Health Manual Run requires a source snapshot for every mapped source.",
                code="MISSING_SOURCE_SNAPSHOT",
                missing_source_dataset_ids=[mapping.get("source_dataset_id") for mapping in missing],
                missing_roles=[mapping.get("role") for mapping in missing],
            )
        return context

    def _read_snapshot_rows(
        self,
        source_context: list[dict[str, Any]],
        contract: dict[str, Any],
    ) -> tuple[dict[str, list[dict[str, Any]]], list[dict[str, Any]]]:
        rows_by_role: dict[str, list[dict[str, Any]]] = {}
        task_results: list[dict[str, Any]] = []
        for item in source_context:
            path = item["artifact_path"]
            rows, schema = read_parquet_rows(path)
            item["row_count"] = len(rows)
            item["bytes"] = path_size(path) or item["bytes"]
            item["schema"] = schema
            rows_by_role[str(item["role"])] = rows
            update_contract_snapshot_ready(contract, item)
            task_results.append(
                succeeded_task_result(
                    f"source_snapshot_read:{item['role']}",
                    row_count=len(rows),
                    bytes=item["bytes"],
                    source_dataset_id=item["source_dataset_id"],
                    source_id=item.get("source_id"),
                    snapshot_id=item.get("snapshot_id"),
                    artifact_uri=item["snapshot"].get("artifact_uri"),
                )
            )
        return rows_by_role, task_results

    def _output_path(self, run_id: str) -> Path:
        return (
            self.output_root
            / "product_health"
            / "gold"
            / f"run_id={run_id}"
            / "gold_product_health.parquet"
        )


class ProductHealthExecutionError(Exception):
    def __init__(self, node_id: str, message: str, **details: Any) -> None:
        super().__init__(message)
        self.node_id = node_id
        self.message = message
        self.details = details


def product_health_run_id() -> str:
    return f"run_product_health_{datetime.now(UTC).strftime('%Y%m%d%H%M%S%f')}"


def now_iso() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def base_execution_result(
    *,
    run_id: str,
    executor: str,
    triggered_by: str,
    timestamp: str,
) -> dict[str, Any]:
    return {
        "contract": "ExecutionResult",
        "run_id": run_id,
        "pipeline_id": PRODUCT_HEALTH_PIPELINE_ID,
        "executor": executor,
        "status": "running",
        "triggered_by": triggered_by,
        "timestamps": {"started_at": timestamp, "finished_at": timestamp},
        "inputs": [],
        "outputs": [],
        "row_count": None,
        "bytes": None,
        "duration_ms": None,
        "task_results": [],
        "logs": [],
    }


def artifact_uri_to_path(artifact_uri: str) -> Path:
    if not artifact_uri:
        return Path("")
    parsed = urlparse(artifact_uri)
    if parsed.scheme == "file":
        return Path(unquote(parsed.path))
    path = Path(artifact_uri)
    return path if path.is_absolute() else repo_root() / path


def read_parquet_rows(path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    import pyarrow.parquet as parquet

    table = parquet.read_table(path)
    schema = [{"name": field.name, "type": str(field.type)} for field in table.schema]
    return table.to_pylist(), schema


def write_gold_parquet(rows: list[dict[str, Any]], schema_fields: list[dict[str, Any]], output_path: Path) -> None:
    import pyarrow as pa
    import pyarrow.parquet as parquet

    output_path.parent.mkdir(parents=True, exist_ok=True)
    arrow_schema = pa.schema([(field["name"], arrow_type(field.get("type"))) for field in schema_fields])
    normalized_rows = [
        {field["name"]: coerce_output_value(row.get(field["name"]), field) for field in schema_fields}
        for row in rows
    ]
    table = pa.Table.from_pylist(normalized_rows, schema=arrow_schema)
    parquet.write_table(table, output_path, compression="snappy")


def arrow_type(type_name: str | None) -> Any:
    import pyarrow as pa

    if type_name == "integer":
        return pa.int64()
    if type_name == "number":
        return pa.float64()
    return pa.string()


def coerce_output_value(value: Any, field: dict[str, Any]) -> Any:
    if value is None:
        if field.get("nullable") is False and field.get("type") == "integer":
            return 0
        return None
    field_type = field.get("type")
    if field_type == "integer":
        return int(value)
    if field_type == "number":
        return float(value)
    return str(value)


def build_gold_rows(
    rows_by_role: dict[str, list[dict[str, Any]]],
    schema_fields: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    products = product_dimensions(rows_by_role)
    review_metrics = aggregate_reviews(rows_by_role.get("reviews", []))
    behavior_metrics = aggregate_behavior(rows_by_role.get("behavior", []))
    delivery_metrics = aggregate_delivery(rows_by_role.get("delivery", []))
    product_ids = sorted(set(products) | set(review_metrics) | set(behavior_metrics) | set(delivery_metrics))
    schema_names = [field["name"] for field in schema_fields]
    gold_rows: list[dict[str, Any]] = []

    for product_id in product_ids:
        product = products.get(product_id, {})
        review = review_metrics.get(product_id, {})
        behavior = behavior_metrics.get(product_id, {})
        delivery = delivery_metrics.get(product_id, {})
        review_count = int(review.get("review_count", 0))
        rating_count = int(review.get("rating_count", 0))
        negative_review_count = int(review.get("negative_review_count", 0))
        view_count = int(behavior.get("view_count", 0))
        purchase_count = int(behavior.get("purchase_count", 0))
        delivery_count = int(delivery.get("delivery_count", 0))
        late_delivery_count = int(delivery.get("late_delivery_count", 0))
        row = {
            **product,
            "product_id": product_id,
            "review_count": review_count,
            "average_rating": round(float(review.get("rating_sum", 0.0)) / rating_count, 6) if rating_count else None,
            "negative_review_rate": ratio_or_none(negative_review_count, review_count),
            "view_count": view_count,
            "purchase_count": purchase_count,
            "conversion_rate": ratio_or_none(purchase_count, view_count),
            "delivery_count": delivery_count,
            "late_delivery_rate": ratio_or_none(late_delivery_count, delivery_count),
        }
        row["risk_score"] = risk_score_for(row)
        gold_rows.append({name: row.get(name) for name in schema_names})
    return gold_rows


def product_dimensions(rows_by_role: dict[str, list[dict[str, Any]]]) -> dict[str, dict[str, Any]]:
    products: dict[str, dict[str, Any]] = {}
    for row in rows_by_role.get("product_master", []):
        product_id = product_id_from_product(row)
        if not product_id:
            continue
        products.setdefault(product_id, {"product_id": product_id})
        merge_missing(products[product_id], product_dimension_values(row))

    for role in ("reviews", "behavior", "delivery"):
        for row in rows_by_role.get(role, []):
            product_id = product_id_from_any(row)
            if not product_id:
                continue
            products.setdefault(product_id, {"product_id": product_id})
            merge_missing(products[product_id], product_hint_values(row))
    return products


def product_dimension_values(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "synthetic_product_id": first_value(row, ["synthetic_product_id"]),
        "canonical_product_id": first_value(row, ["canonical_product_id"]),
        "product_name": first_value(row, ["product_name", "title", "name", "item.title"]),
        "normalized_brand": first_value(row, ["normalized_brand", "brand", "item.brand"]),
        "unified_category": first_value(row, ["unified_category", "category", "main_category", "item.category_id"]),
        "category_l1": category_l1(row),
        "ecommerce_product_id": first_value(row, ["ecommerce_product_id", "item_id", "item.item_id"]),
        "amazon_parent_asin": first_value(row, ["amazon_parent_asin", "parent_asin", "asin"]),
        "match_confidence": finite_float(first_value(row, ["match_confidence"])),
        "match_method": first_value(row, ["match_method"]),
    }


def product_hint_values(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "product_name": first_value(row, ["product_name", "product_title", "title", "name", "item.title"]),
        "normalized_brand": first_value(row, ["normalized_brand", "brand", "item.brand"]),
        "unified_category": first_value(row, ["unified_category", "category", "main_category", "item.category_id"]),
        "category_l1": category_l1(row),
        "ecommerce_product_id": first_value(row, ["ecommerce_product_id", "item_id", "item.item_id"]),
        "amazon_parent_asin": first_value(row, ["amazon_parent_asin", "parent_asin", "asin"]),
    }


def merge_missing(target: dict[str, Any], values: dict[str, Any]) -> None:
    for key, value in values.items():
        if target.get(key) in (None, "") and value not in (None, ""):
            target[key] = value


def aggregate_reviews(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    metrics: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"review_count": 0, "rating_sum": 0.0, "rating_count": 0, "negative_review_count": 0}
    )
    for row in rows:
        product_id = product_id_from_any(row)
        if not product_id:
            continue
        rating = finite_float(first_value(row, ["rating", "star_rating", "score"]))
        sentiment = str(first_value(row, ["sentiment", "review_sentiment"]) or "").lower()
        item = metrics[product_id]
        item["review_count"] += 1
        if rating is not None:
            item["rating_sum"] += rating
            item["rating_count"] += 1
        if (rating is not None and rating <= 2) or sentiment in {"negative", "very_negative"}:
            item["negative_review_count"] += 1
    return metrics


def aggregate_behavior(rows: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    metrics: dict[str, dict[str, int]] = defaultdict(lambda: {"view_count": 0, "purchase_count": 0})
    for row in rows:
        product_id = product_id_from_any(row)
        if not product_id:
            continue
        action = str(first_value(row, ["event_type", "event_name", "behavior_type", "action", "interaction.action"]) or "").lower()
        if any(token in action for token in ["view", "impression", "product_view"]):
            metrics[product_id]["view_count"] += 1
        if any(token in action for token in ["purchase", "buy", "order", "checkout"]):
            metrics[product_id]["purchase_count"] += 1
    return metrics


def aggregate_delivery(rows: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    metrics: dict[str, dict[str, int]] = defaultdict(lambda: {"delivery_count": 0, "late_delivery_count": 0})
    for row in rows:
        product_id = product_id_from_any(row)
        if not product_id:
            continue
        item = metrics[product_id]
        item["delivery_count"] += 1
        late = parse_bool(first_value(row, ["late_flag", "late_delivery_flag", "is_late_60"]))
        late_minutes = finite_float(first_value(row, ["late_minutes", "delay_minutes"]))
        promised_at = parse_dt(first_value(row, ["promised_at", "delivery_promised_at"]))
        delivered_at = parse_dt(first_value(row, ["delivered_at", "delivery_delivered_at"]))
        if late is True or (late_minutes is not None and late_minutes > 0) or (
            promised_at is not None and delivered_at is not None and delivered_at > promised_at
        ):
            item["late_delivery_count"] += 1
    return metrics


def product_id_from_product(row: dict[str, Any]) -> str | None:
    value = first_value(
        row,
        [
            "product_id",
            "canonical_product_id",
            "synthetic_product_id",
            "ecommerce_product_id",
            "amazon_parent_asin",
            "parent_asin",
            "asin",
            "item_id",
            "item.item_id",
        ],
    )
    return str(value) if value not in (None, "") else None


def product_id_from_any(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["product_id", "parent_asin", "asin", "item_id", "item.item_id"])
    return str(value) if value not in (None, "") else None


def nested_get(value: dict[str, Any], path: str) -> Any:
    current: Any = value
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]
    return current


def first_value(row: dict[str, Any], paths: list[str]) -> Any:
    for path in paths:
        value = nested_get(row, path) if "." in path else row.get(path)
        if value not in (None, ""):
            return value
    return None


def category_l1(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["category_l1", "unified_category", "main_category", "category", "item.category_id"])
    if value is not None:
        return str(value)
    categories = row.get("categories")
    if isinstance(categories, list) and categories:
        return str(categories[0])
    return None


def finite_float(value: Any) -> float | None:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return None
    return numeric if math.isfinite(numeric) else None


def parse_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if value is None:
        return None
    text = str(value).strip().lower()
    if text in {"true", "1", "yes", "y"}:
        return True
    if text in {"false", "0", "no", "n"}:
        return False
    return None


def parse_dt(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo is not None else value.replace(tzinfo=UTC)
    if isinstance(value, (int, float)):
        seconds = value / 1000 if value > 10_000_000_000 else value
        return datetime.fromtimestamp(seconds, tz=UTC)
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else parsed.replace(tzinfo=UTC)


def ratio_or_none(numerator: int | float, denominator: int | float) -> float | None:
    if denominator == 0:
        return None
    return round(float(numerator) / float(denominator), 6)


def risk_score_for(row: dict[str, Any]) -> float | None:
    average_rating = finite_float(row.get("average_rating"))
    conversion_rate = finite_float(row.get("conversion_rate"))
    components = {
        "negative_review_rate": finite_float(row.get("negative_review_rate")),
        "low_rating_score": None if average_rating is None else min(max((5.0 - average_rating) / 4.0, 0.0), 1.0),
        "low_conversion_score": None if conversion_rate is None else min(max(1.0 - conversion_rate, 0.0), 1.0),
        "late_delivery_rate": finite_float(row.get("late_delivery_rate")),
    }
    available = {name: value for name, value in components.items() if value is not None}
    if not available:
        return None
    total_weight = sum(RISK_WEIGHTS[name] for name in available)
    return round(100 * sum(float(value) * (RISK_WEIGHTS[name] / total_weight) for name, value in available.items()), 2)


def evaluate_quality_results(
    pending_results: list[dict[str, Any]],
    rows: list[dict[str, Any]],
    schema_fields: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    results = []
    expected_columns = [field["name"] for field in schema_fields]
    actual_columns = list(rows[0].keys()) if rows else expected_columns
    for rule in pending_results:
        rule_id = rule.get("rule_id")
        passed = True
        message = "passed"
        if rule_id == "schema_match":
            passed = actual_columns == expected_columns
            message = "Gold output schema matches contract." if passed else "Gold output schema does not match contract."
        elif rule_id == "row_count_nonzero":
            passed = len(rows) >= 1
            message = "Gold output has rows." if passed else "Gold output has no rows."
        elif rule_id == "risk_score_range":
            scores = [row.get("risk_score") for row in rows if row.get("risk_score") is not None]
            passed = all(0 <= float(score) <= 100 for score in scores)
            message = "risk_score values are within 0..100." if passed else "risk_score is outside 0..100."
        elif rule_id == "zero_denominator_policy":
            message = "Zero denominator metrics are emitted as null."
        results.append({**rule, "status": "passed" if passed else "failed", "message": message})
    return results


def quality_task_results(quality_results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "node_id": f"quality:{result['rule_id']}",
            "status": "succeeded" if result["status"] == "passed" else "failed",
            "row_count": None,
            "bytes": None,
            "message": result.get("message"),
        }
        for result in quality_results
    ]


def apply_snapshot_context(
    contract: dict[str, Any],
    source_context: list[dict[str, Any]],
    missing_mappings: list[dict[str, Any]],
) -> None:
    context_by_dataset = {item["source_dataset_id"]: item for item in source_context}
    missing_ids = {mapping.get("source_dataset_id") for mapping in missing_mappings}
    for snapshot_input in contract["source_snapshot_inputs"]:
        source_dataset_id = snapshot_input.get("source_dataset_id")
        item = context_by_dataset.get(source_dataset_id)
        if item is not None:
            snapshot = item["snapshot"]
            snapshot_input.update(
                {
                    "snapshot_id": snapshot.get("snapshot_id"),
                    "snapshot_status": SOURCE_SNAPSHOT_READY,
                    "artifact_uri": snapshot.get("artifact_uri"),
                    "format": snapshot.get("format", SUPPORTED_SNAPSHOT_FORMAT),
                    "row_count": snapshot.get("row_count"),
                    "bytes": snapshot.get("bytes"),
                    "schema": [schema.model_dump() if hasattr(schema, "model_dump") else schema for schema in snapshot.get("schema", [])],
                    "created_at": snapshot.get("created_at"),
                }
            )
        elif source_dataset_id in missing_ids:
            snapshot_input["snapshot_status"] = SOURCE_SNAPSHOT_MISSING


def update_contract_snapshot_ready(contract: dict[str, Any], item: dict[str, Any]) -> None:
    for snapshot_input in contract["source_snapshot_inputs"]:
        if snapshot_input.get("source_dataset_id") != item["source_dataset_id"]:
            continue
        snapshot_input.update(
            {
                "snapshot_status": SOURCE_SNAPSHOT_READY,
                "row_count": item["row_count"],
                "bytes": item["bytes"],
                "schema": item["schema"],
            }
        )


def completed_contract(
    *,
    contract: dict[str, Any],
    source_context: list[dict[str, Any]],
    output_path: Path,
    output_bytes: int,
    gold_rows: list[dict[str, Any]],
    quality_results: list[dict[str, Any]],
    run_id: str,
    status: str,
) -> dict[str, Any]:
    storage_uri = output_path.resolve().as_uri()
    snapshot_ids = [item.get("snapshot_id") for item in source_context if item.get("snapshot_id")]
    source_dataset_ids = [item["source_dataset_id"] for item in source_context]
    source_ids = [item["source_id"] for item in source_context if item.get("source_id")]
    quality_summary = "passed" if status == PRODUCT_HEALTH_SUCCEEDED else "failed"
    contract["status"] = status
    contract["status_reason"] = "Product Health Manual Run executed from source snapshot artifacts."
    contract["gold_output"].update(
        {
            "storage_uri": storage_uri,
            "local_fallback_path": str(output_path),
            "row_count": len(gold_rows),
            "bytes": output_bytes,
            "status": status,
        }
    )
    contract["quality_results"] = quality_results
    contract["lineage"].update(
        {
            "input_source_dataset_ids": source_dataset_ids,
            "input_snapshot_ids": snapshot_ids,
            "source_ids": source_ids,
            "runtime_output_scope": "product_health_gold_output",
        }
    )
    contract["catalog_payload"].update(
        {
            "status": "ready_for_catalog_registration" if status == PRODUCT_HEALTH_SUCCEEDED else "blocked_by_quality",
            "run_id": run_id,
            "storage_uri": storage_uri,
            "local_fallback_path": str(output_path),
            "quality_results": quality_results,
        }
    )
    contract["catalog_payload"]["metrics"].update(
        {
            "row_count": len(gold_rows),
            "bytes": output_bytes,
            "quality_summary": quality_summary,
        }
    )
    contract["catalog_payload"]["lineage"].update(
        {
            "source_snapshot_ids": snapshot_ids,
            "source_dataset_ids": source_dataset_ids,
            "source_ids": source_ids,
            "run_id": run_id,
        }
    )
    contract["error"] = None
    return contract


def failed_contract(contract: dict[str, Any], error: ProductHealthExecutionError) -> dict[str, Any]:
    contract["status"] = PRODUCT_HEALTH_FAILED
    contract["status_reason"] = error.message
    contract["gold_output"]["status"] = PRODUCT_HEALTH_FAILED
    for result in contract["quality_results"]:
        result["status"] = "skipped"
        result["message"] = "Quality checks were skipped because Product Health execution did not produce Gold output."
    contract["lineage"]["runtime_output_scope"] = "product_health_gold_output_failed"
    contract["catalog_payload"]["status"] = "blocked_by_product_health_execution"
    contract["catalog_payload"]["metrics"]["quality_summary"] = "not_run"
    contract["error"] = {
        "code": error.details.get("code", "PRODUCT_HEALTH_EXECUTION_FAILED"),
        "message": error.message,
        **{key: value for key, value in error.details.items() if key != "code"},
    }
    if error.details.get("code") == "SOURCE_SNAPSHOT_ARTIFACT_NOT_FOUND":
        mark_invalid_snapshot(contract, error.details)
    return contract


def mark_invalid_snapshot(contract: dict[str, Any], details: dict[str, Any]) -> None:
    source_dataset_id = details.get("source_dataset_id")
    for snapshot_input in contract["source_snapshot_inputs"]:
        if snapshot_input.get("source_dataset_id") == source_dataset_id:
            snapshot_input["snapshot_status"] = SOURCE_SNAPSHOT_INVALID


def succeeded_task_result(node_id: str, *, row_count: int | None, bytes: int | None, **extra: Any) -> dict[str, Any]:
    return {"node_id": node_id, "status": "succeeded", "row_count": row_count, "bytes": bytes, **extra}


def failed_task_result(node_id: str, message: str, **extra: Any) -> dict[str, Any]:
    return {"node_id": node_id, "status": "failed", "row_count": None, "bytes": None, "error": message, **extra}


def write_execution_summary(path: Path, execution_result: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(execution_result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
