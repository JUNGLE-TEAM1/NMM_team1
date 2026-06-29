#!/usr/bin/env python3
"""Execute the M3 product-health transform contract as a local reference check.

This is not the M2 Spark runtime. It is a small deterministic runner that proves
the M3 ProductHealth transform spec has executable semantics, fixed output
columns, zero-denominator behavior, and source-adaptive risk scoring.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


OUTPUT_COLUMNS = [
    "product_id",
    "product_name",
    "category_l1",
    "review_count",
    "average_rating",
    "negative_review_rate",
    "view_count",
    "purchase_count",
    "conversion_rate",
    "delivery_count",
    "late_delivery_rate",
    "risk_score",
]

BASE_RISK_WEIGHTS = {
    "negative_review_rate": 0.35,
    "low_rating_score": 0.30,
    "low_conversion_score": 0.20,
    "late_delivery_rate": 0.15,
}


def nested_get(value: dict[str, Any], path: str) -> Any:
    current: Any = value
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]
    return current


def first_value(row: dict[str, Any], paths: Iterable[str]) -> Any:
    for path in paths:
        value = nested_get(row, path) if "." in path else row.get(path)
        if value not in (None, ""):
            return value
    return None


def finite_float(value: Any) -> float | None:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(numeric):
        return None
    return numeric


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
    if isinstance(value, (int, float)):
        seconds = value / 1000 if value > 10_000_000_000 else value
        return datetime.fromtimestamp(seconds, tz=timezone.utc)
    text = str(value).replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def iter_jsonl(path: Path, limit: int | None) -> Iterable[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        for index, line in enumerate(handle, start=1):
            if limit is not None and index > limit:
                break
            if not line.strip():
                continue
            yield json.loads(line)


def iter_json(path: Path, limit: int | None) -> Iterable[dict[str, Any]]:
    loaded = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(loaded, list):
        records = loaded
    elif isinstance(loaded, dict):
        records = next(
            (value for key, value in loaded.items() if key in {"records", "rows", "data", "items"} and isinstance(value, list)),
            [loaded],
        )
    else:
        records = []
    for index, row in enumerate(records, start=1):
        if limit is not None and index > limit:
            break
        if isinstance(row, dict):
            yield row


def iter_csv(path: Path, limit: int | None) -> Iterable[dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for index, row in enumerate(reader, start=1):
            if limit is not None and index > limit:
                break
            yield dict(row)


def iter_records(path: Path | None, limit: int | None) -> Iterable[dict[str, Any]]:
    if path is None:
        return []
    if path.suffix.lower() == ".csv":
        return iter_csv(path, limit)
    if path.suffix.lower() == ".json":
        return iter_json(path, limit)
    return iter_jsonl(path, limit)


def source_evidence(path: Path | None, limit: int | None, product_id_reader: Any) -> dict[str, Any]:
    if path is None:
        return {
            "input_path": None,
            "input_bytes": 0,
            "rows_scanned": 0,
            "product_id_present_rows": 0,
            "product_id_missing_rows": 0,
            "unique_product_ids": 0,
            "scan_limit": limit,
            "evidence_scope": "source_not_provided",
        }
    rows_scanned = 0
    product_id_present_rows = 0
    product_ids: set[str] = set()
    for row in iter_records(path, limit):
        rows_scanned += 1
        product_id = product_id_reader(row)
        if product_id:
            product_id_present_rows += 1
            product_ids.add(product_id)
    return {
        "input_path": str(path),
        "input_bytes": path.stat().st_size,
        "rows_scanned": rows_scanned,
        "product_id_present_rows": product_id_present_rows,
        "product_id_missing_rows": rows_scanned - product_id_present_rows,
        "unique_product_ids": len(product_ids),
        "scan_limit": limit,
        "evidence_scope": "bounded_reference_transform_scan",
    }


def product_id_from_review(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["product_id", "parent_asin", "asin", "item_id", "item.item_id"])
    return str(value) if value is not None else None


def product_id_from_product(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["product_id", "parent_asin", "asin", "item_id", "item.item_id"])
    return str(value) if value is not None else None


def product_id_from_behavior(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["product_id", "item_id", "item.item_id", "asin", "parent_asin"])
    return str(value) if value is not None else None


def product_id_from_delivery(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["product_id", "item_id", "item.item_id", "asin", "parent_asin"])
    return str(value) if value is not None else None


def product_name(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["product_name", "title", "name", "item.title"])
    return str(value) if value is not None else None


def review_product_name_hint(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["product_name", "product_title"])
    return str(value) if value is not None else None


def behavior_product_name_hint(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["product_name", "item.title", "name"])
    return str(value) if value is not None else None


def category_l1(row: dict[str, Any]) -> str | None:
    value = first_value(row, ["category_l1", "main_category", "category", "item.category_id"])
    if value is not None:
        return str(value)
    categories = row.get("categories")
    if isinstance(categories, list) and categories:
        return str(categories[0])
    return None


def behavior_action(row: dict[str, Any]) -> str:
    value = first_value(row, ["event_type", "event_name", "behavior_type", "action", "interaction.action"])
    return str(value or "").lower()


def is_view_action(action: str) -> bool:
    return any(token in action for token in ["view", "impression", "pv", "product_impression"])


def is_purchase_action(action: str) -> bool:
    return any(token in action for token in ["purchase", "buy", "order", "checkout"])


def load_product_master(path: Path | None, limit: int | None) -> dict[str, dict[str, str | None]]:
    products: dict[str, dict[str, str | None]] = {}
    for row in iter_records(path, limit):
        product_id = product_id_from_product(row)
        if not product_id:
            continue
        current = products.setdefault(product_id, {"product_name": None, "category_l1": None})
        current["product_name"] = current["product_name"] or product_name(row)
        current["category_l1"] = current["category_l1"] or category_l1(row)
    return products


def merge_product_hints(
    products: dict[str, dict[str, str | None]],
    path: Path | None,
    limit: int | None,
    product_id_reader: Any,
    product_name_reader: Any,
    category_reader: Any,
) -> None:
    for row in iter_records(path, limit):
        product_id = product_id_reader(row)
        if not product_id:
            continue
        current = products.setdefault(product_id, {"product_name": None, "category_l1": None})
        current["product_name"] = current["product_name"] or product_name_reader(row)
        current["category_l1"] = current["category_l1"] or category_reader(row)


def aggregate_reviews(path: Path | None, limit: int | None) -> dict[str, dict[str, Any]]:
    agg: dict[str, dict[str, Any]] = defaultdict(lambda: {"review_count": 0, "rating_sum": 0.0, "rating_count": 0, "negative_review_count": 0})
    for row in iter_records(path, limit):
        product_id = product_id_from_review(row)
        if not product_id:
            continue
        rating = finite_float(first_value(row, ["rating", "star_rating", "score"]))
        item = agg[product_id]
        item["review_count"] += 1
        if rating is not None:
            item["rating_sum"] += rating
            item["rating_count"] += 1
            if rating <= 2:
                item["negative_review_count"] += 1
        sentiment = str(first_value(row, ["sentiment", "review_sentiment"]) or "").lower()
        if sentiment in {"negative", "very_negative"} and rating is None:
            item["negative_review_count"] += 1
    return agg


def aggregate_behavior(path: Path | None, limit: int | None) -> dict[str, dict[str, int]]:
    agg: dict[str, dict[str, int]] = defaultdict(lambda: {"view_count": 0, "purchase_count": 0})
    for row in iter_records(path, limit):
        product_id = product_id_from_behavior(row)
        if not product_id:
            continue
        action = behavior_action(row)
        if is_view_action(action):
            agg[product_id]["view_count"] += 1
        if is_purchase_action(action):
            agg[product_id]["purchase_count"] += 1
    return agg


def aggregate_delivery(path: Path | None, limit: int | None) -> dict[str, dict[str, int]]:
    agg: dict[str, dict[str, int]] = defaultdict(lambda: {"delivery_count": 0, "late_delivery_count": 0})
    for row in iter_records(path, limit):
        product_id = product_id_from_delivery(row)
        if not product_id:
            continue
        item = agg[product_id]
        item["delivery_count"] += 1
        late = parse_bool(first_value(row, ["late_flag", "late_delivery_flag", "is_late_60"]))
        promised_at = parse_dt(first_value(row, ["promised_at", "delivery_promised_at"]))
        delivered_at = parse_dt(first_value(row, ["delivered_at", "delivery_delivered_at"]))
        if late is True or (promised_at is not None and delivered_at is not None and delivered_at > promised_at):
            item["late_delivery_count"] += 1
    return agg


def ratio_or_none(numerator: int | float, denominator: int | float) -> float | None:
    if denominator == 0:
        return None
    return round(float(numerator) / float(denominator), 6)


def low_rating_score(average_rating: float | None) -> float | None:
    if average_rating is None:
        return None
    return round(min(max((5.0 - average_rating) / 4.0, 0.0), 1.0), 6)


def low_conversion_score(conversion_rate: float | None) -> float | None:
    if conversion_rate is None:
        return None
    return round(min(max(1.0 - conversion_rate, 0.0), 1.0), 6)


def risk_score_for(row: dict[str, Any]) -> tuple[float | None, dict[str, Any]]:
    components = {
        "negative_review_rate": row["negative_review_rate"],
        "low_rating_score": low_rating_score(row["average_rating"]),
        "low_conversion_score": low_conversion_score(row["conversion_rate"]),
        "late_delivery_rate": row["late_delivery_rate"],
    }
    available = {name: value for name, value in components.items() if value is not None}
    if not available:
        return None, {"available_components": [], "weights_used": {}, "missing_components": sorted(components)}
    total = sum(BASE_RISK_WEIGHTS[name] for name in available)
    weights = {name: round(BASE_RISK_WEIGHTS[name] / total, 6) for name in available}
    score = round(100 * sum(float(available[name]) * weights[name] for name in available), 2)
    return score, {
        "available_components": sorted(available),
        "weights_used": weights,
        "missing_components": sorted(name for name, value in components.items() if value is None),
        "normalization": "renormalize_over_available_approved_components",
    }


def build_gold_rows(
    products: dict[str, dict[str, str | None]],
    reviews: dict[str, dict[str, Any]],
    behavior: dict[str, dict[str, int]],
    delivery: dict[str, dict[str, int]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    product_ids = sorted(set(products) | set(reviews) | set(behavior) | set(delivery))
    rows: list[dict[str, Any]] = []
    coverage: list[dict[str, Any]] = []
    for product_id in product_ids:
        product = products.get(product_id, {})
        review = reviews.get(product_id, {})
        behavior_item = behavior.get(product_id, {})
        delivery_item = delivery.get(product_id, {})
        review_count = int(review.get("review_count", 0))
        rating_count = int(review.get("rating_count", 0))
        rating_sum = float(review.get("rating_sum", 0.0))
        negative_review_count = int(review.get("negative_review_count", 0))
        view_count = int(behavior_item.get("view_count", 0))
        purchase_count = int(behavior_item.get("purchase_count", 0))
        delivery_count = int(delivery_item.get("delivery_count", 0))
        late_delivery_count = int(delivery_item.get("late_delivery_count", 0))
        row = {
            "product_id": product_id,
            "product_name": product.get("product_name"),
            "category_l1": product.get("category_l1"),
            "review_count": review_count,
            "average_rating": round(rating_sum / rating_count, 6) if rating_count else None,
            "negative_review_rate": ratio_or_none(negative_review_count, review_count),
            "view_count": view_count,
            "purchase_count": purchase_count,
            "conversion_rate": ratio_or_none(purchase_count, view_count),
            "delivery_count": delivery_count,
            "late_delivery_rate": ratio_or_none(late_delivery_count, delivery_count),
            "risk_score": None,
        }
        row["risk_score"], coverage_item = risk_score_for(row)
        rows.append(row)
        coverage.append({"product_id": product_id, **coverage_item})
    return rows, coverage


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
            count += 1
    return count


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def run(args: argparse.Namespace) -> dict[str, Any]:
    source_level_evidence = {
        "reviews": source_evidence(args.reviews, args.review_limit, product_id_from_review),
        "behavior": source_evidence(args.behavior, args.behavior_limit, product_id_from_behavior),
        "delivery": source_evidence(args.delivery, args.delivery_limit, product_id_from_delivery),
        "product_master": source_evidence(args.product_master, args.product_limit, product_id_from_product),
    }
    products = load_product_master(args.product_master, args.product_limit)
    merge_product_hints(products, args.reviews, args.review_limit, product_id_from_review, review_product_name_hint, category_l1)
    merge_product_hints(products, args.behavior, args.behavior_limit, product_id_from_behavior, behavior_product_name_hint, category_l1)
    merge_product_hints(products, args.delivery, args.delivery_limit, product_id_from_delivery, lambda row: None, lambda row: None)
    reviews = aggregate_reviews(args.reviews, args.review_limit)
    behavior = aggregate_behavior(args.behavior, args.behavior_limit)
    delivery = aggregate_delivery(args.delivery, args.delivery_limit)
    rows, coverage = build_gold_rows(products, reviews, behavior, delivery)
    output_row_limit = args.output_limit if args.output_limit and args.output_limit > 0 else None
    limited_rows = rows[:output_row_limit] if output_row_limit else rows
    limited_coverage = coverage[: len(limited_rows)]
    output_jsonl = args.output_dir / "gold_product_health.jsonl"
    output_csv = args.output_dir / "gold_product_health.csv"
    coverage_path = args.output_dir / "risk_score_coverage.jsonl"
    write_jsonl(output_jsonl, limited_rows)
    write_csv(output_csv, limited_rows)
    write_jsonl(coverage_path, limited_coverage)
    summary = {
        "contract": "ProductHealthReferenceTransformResult",
        "producer": "M3 local reference validation",
        "m2_runtime_claim": False,
        "catalog_ready_claim": False,
        "reference_runner_scope": "small deterministic contract check; M2 owns distributed Spark implementation",
        "cross_source_identity_guard": {
            "identity_mapping_approved": bool(getattr(args, "identity_mapping_approved", False)),
            "identity_scope": getattr(args, "identity_scope", "unverified_reference_domain"),
            "rule": "Do not present a multi-source product_health output as approved Gold unless source identity mapping is approved by L9 or an equivalent owner decision.",
            "catalog_ready_without_m5_l9": False,
        },
        "output_schema": OUTPUT_COLUMNS,
        "row_count": len(limited_rows),
        "full_product_universe_count": len(rows),
        "output_row_limit": output_row_limit,
        "output_truncated": len(limited_rows) < len(rows),
        "truncated_product_count": max(0, len(rows) - len(limited_rows)),
        "source_counts": {
            "product_universe_products": len(products),
            "review_products": len(reviews),
            "behavior_products": len(behavior),
            "delivery_products": len(delivery),
        },
        "input_total_bytes": sum(evidence["input_bytes"] for evidence in source_level_evidence.values()),
        "input_total_rows_scanned": sum(evidence["rows_scanned"] for evidence in source_level_evidence.values()),
        "source_level_evidence": source_level_evidence,
        "gold_reduction_interpretation": {
            "expected": "Gold may be much smaller than raw input because it is grouped by product_id.",
            "must_not_hide_loss": "Use source_level_evidence product_id_missing_rows, unique_product_ids, full_product_universe_count, output_truncated, metric_non_null_counts, and risk_score_coverage to distinguish aggregation from silent data loss.",
        },
        "join_strategy": "full_outer_product_id_union_with_product_master_preferred_dimensions",
        "input_paths": {
            "reviews": str(args.reviews) if args.reviews else None,
            "behavior": str(args.behavior) if args.behavior else None,
            "delivery": str(args.delivery) if args.delivery else None,
            "product_master": str(args.product_master) if args.product_master else None,
        },
        "metric_non_null_counts": {
            "average_rating": sum(1 for row in limited_rows if row["average_rating"] is not None),
            "negative_review_rate": sum(1 for row in limited_rows if row["negative_review_rate"] is not None),
            "conversion_rate": sum(1 for row in limited_rows if row["conversion_rate"] is not None),
            "late_delivery_rate": sum(1 for row in limited_rows if row["late_delivery_rate"] is not None),
            "risk_score": sum(1 for row in limited_rows if row["risk_score"] is not None),
        },
        "zero_denominator_policy": {
            "average_rating": "null_when_review_count_is_zero",
            "negative_review_rate": "null_when_review_count_is_zero",
            "conversion_rate": "null_when_view_count_is_zero",
            "late_delivery_rate": "null_when_delivery_count_is_zero",
            "risk_score": "null_when_no_component_is_available",
        },
        "risk_score_policy": {
            "mode": "source_evidence_adaptive",
            "base_weights": BASE_RISK_WEIGHTS,
            "missing_component_handling": "exclude_from_weight_and_record_in_risk_score_coverage",
            "formula": "round(100 * weighted_average(available_components, renormalize_missing=true), 2)",
            "conversion_component_test_fallback": "1 - conversion_rate; not a universal production risk formula",
        },
        "outputs": {
            "gold_jsonl": str(output_jsonl),
            "gold_csv": str(output_csv),
            "risk_score_coverage_jsonl": str(coverage_path),
        },
    }
    write_json(args.output_dir / "product_health_reference_summary.json", summary)
    return summary


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reviews", type=Path)
    parser.add_argument("--behavior", type=Path)
    parser.add_argument("--delivery", type=Path)
    parser.add_argument("--product-master", type=Path)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--review-limit", type=int, default=50_000)
    parser.add_argument("--behavior-limit", type=int, default=50_000)
    parser.add_argument("--delivery-limit", type=int, default=50_000)
    parser.add_argument("--product-limit", type=int, default=50_000)
    parser.add_argument("--output-limit", type=int, default=0, help="Optional debug cap for emitted Gold rows. Default 0 means no cap.")
    parser.add_argument("--identity-scope", default="unverified_reference_domain")
    parser.add_argument("--identity-mapping-approved", action="store_true")
    return parser.parse_args()


def main() -> int:
    summary = run(parse_args())
    print(json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
