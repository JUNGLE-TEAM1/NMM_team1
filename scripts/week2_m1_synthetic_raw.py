#!/usr/bin/env python3
"""Generate Week 2 M1 demo raw seeds from Amazon Reviews 2023 JSONL files."""

from __future__ import annotations

import argparse
import json
import os
import random
import shutil
import subprocess
import sys
import urllib.request
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any, Iterable


BASE_URL = "https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023/resolve/main"
REQUIRED_REVIEW_FIELDS = [
    "review_id",
    "product_id",
    "rating",
    "review_text",
    "review_time",
    "verified_purchase",
]


def load_hf_token() -> str | None:
    token = os.environ.get("HF_TOKEN")
    if token:
        return token
    if not shutil.which("security"):
        return None
    try:
        result = subprocess.run(
            ["security", "find-generic-password", "-a", os.environ.get("USER", ""), "-s", "asklake-hf-token", "-w"],
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError:
        return None
    return result.stdout.strip() or None


def download_file(url: str, output_path: Path, token: str | None) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.exists() and output_path.stat().st_size > 0:
        return

    request = urllib.request.Request(url)
    if token:
        request.add_header("Authorization", f"Bearer {token}")

    tmp_path = output_path.with_suffix(output_path.suffix + ".tmp")
    with urllib.request.urlopen(request, timeout=120) as response, tmp_path.open("wb") as out:
        shutil.copyfileobj(response, out)
    tmp_path.replace(output_path)


def iter_jsonl(path: Path) -> Iterable[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                value = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_number}: invalid JSONL") from exc
            if isinstance(value, dict):
                yield value


def amazon_timestamp_to_iso(value: Any) -> str | None:
    if value in (None, ""):
        return None
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return str(value)
    if numeric > 10_000_000_000:
        numeric = numeric / 1000
    return datetime.fromtimestamp(numeric, tz=UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def to_review_seed(row: dict[str, Any], index: int) -> dict[str, Any]:
    product_id = row.get("parent_asin") or row.get("asin")
    return {
        "review_id": f"R{index:06d}",
        "product_id": str(product_id or f"P{index:06d}"),
        "rating": row.get("rating"),
        "review_text": row.get("text") or row.get("title") or "",
        "review_time": amazon_timestamp_to_iso(row.get("timestamp")),
        "verified_purchase": bool(row.get("verified_purchase")),
    }


def price_band(value: Any) -> str:
    try:
        price = float(value)
    except (TypeError, ValueError):
        return "unknown"
    if price < 20:
        return "low"
    if price < 100:
        return "mid"
    return "high"


def to_product_seed(row: dict[str, Any], fallback_index: int) -> dict[str, Any]:
    product_id = row.get("parent_asin") or row.get("asin") or f"P{fallback_index:06d}"
    categories = row.get("categories") if isinstance(row.get("categories"), list) else []
    main_category = row.get("main_category") or (categories[0] if categories else None)
    category_l2 = categories[1] if len(categories) > 1 else None
    return {
        "product_id": str(product_id),
        "source_parent_asin": str(product_id),
        "product_name": row.get("title") or "",
        "category_l1": main_category or "Unknown",
        "category_l2": category_l2 or "Unknown",
        "price_band": price_band(row.get("price")),
        "is_synthetic_source": False,
    }


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
            count += 1
    return count


def take_review_rows(source_path: Path, row_count: int) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for index, raw_row in enumerate(iter_jsonl(source_path), start=1):
        rows.append(to_review_seed(raw_row, index))
        if len(rows) >= row_count:
            break
    if len(rows) < row_count:
        raise ValueError(f"Only {len(rows)} review rows available, need {row_count}")
    return rows


def take_product_rows(source_path: Path, row_count: int) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw_row in iter_jsonl(source_path):
        product = to_product_seed(raw_row, len(rows) + 1)
        if product["product_id"] in seen:
            continue
        seen.add(product["product_id"])
        rows.append(product)
        if len(rows) >= row_count:
            break
    if not rows:
        raise ValueError("No product metadata rows available")
    return rows


def behavior_rows(products: list[dict[str, Any]], reviews: list[dict[str, Any]], events_per_product: int) -> list[dict[str, Any]]:
    random.seed(20260626)
    review_times = [row["review_time"] for row in reviews if row.get("review_time")]
    base_at = datetime(2024, 5, 1, 9, 0, tzinfo=UTC)
    if review_times:
        try:
            base_at = datetime.fromisoformat(review_times[0].replace("Z", "+00:00")).replace(hour=9, minute=0, second=0)
        except ValueError:
            pass

    event_types = ["view", "cart", "purchase"]
    rows: list[dict[str, Any]] = []
    for product_index, product in enumerate(products, start=1):
        for event_index in range(events_per_product):
            event_number = len(rows) + 1
            event_type = event_types[event_index % len(event_types)]
            event_at = base_at + timedelta(minutes=event_number * 3)
            rows.append(
                {
                    "event_id": f"E{event_number:06d}",
                    "event_at": event_at.isoformat().replace("+00:00", "Z"),
                    "event_type": event_type,
                    "product_id": product["product_id"],
                    "user_id": f"U{random.randint(1, 2500):06d}",
                    "session_id": f"S{product_index:06d}-{event_index // len(event_types):03d}",
                    "event_price": None,
                    "is_synthetic_source": True,
                }
            )
    return rows


def summarize_reviews(rows: list[dict[str, Any]]) -> dict[str, Any]:
    times = [row["review_time"] for row in rows if row.get("review_time")]
    return {
        "row_count": len(rows),
        "required_fields": REQUIRED_REVIEW_FIELDS,
        "required_fields_present": all(all(field in row for field in REQUIRED_REVIEW_FIELDS) for row in rows),
        "min_review_time": min(times) if times else None,
        "max_review_time": max(times) if times else None,
    }


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def generate(args: argparse.Namespace) -> dict[str, Any]:
    token = load_hf_token()
    external_root = args.external_root
    output_root = args.output_root
    review_source = external_root / "raw" / "review_categories" / f"{args.category}.jsonl"
    meta_source = external_root / "raw" / "meta_categories" / f"meta_{args.category}.jsonl"

    download_file(f"{BASE_URL}/raw/review_categories/{args.category}.jsonl", review_source, token)
    download_file(f"{BASE_URL}/raw/meta_categories/meta_{args.category}.jsonl", meta_source, token)

    reviews = take_review_rows(review_source, args.review_rows)
    products = take_product_rows(meta_source, args.product_rows)
    events = behavior_rows(products, reviews, args.events_per_product)

    raw_demo_root = output_root / "raw_demo"
    metadata_root = output_root / "metadata"
    review_path = raw_demo_root / "reviews_seed.jsonl"
    product_path = raw_demo_root / "product_master_seed.jsonl"
    behavior_path = raw_demo_root / "behavior_events_seed.jsonl"
    manifest_path = metadata_root / "source_manifest.json"
    summary_path = metadata_root / "raw_demo_summary.json"

    review_count = write_jsonl(review_path, reviews)
    product_count = write_jsonl(product_path, products)
    behavior_count = write_jsonl(behavior_path, events)

    selected_option = args.selected_option or (
        "option_2_recommended_mvp_demo" if args.review_rows >= 100_000 and args.product_rows >= 10_000 else "option_1_minimum_start"
    )

    manifest = {
        "dataset_name": "week2_mvp_demo_raw",
        "connector_type": "json",
        "logical_shape": "amazon_reviews_json",
        "source_profile": "amazon_reviews_json",
        "data_origin": "demo_synthetic_raw",
        "fixture_origin": "demo_synthetic_raw",
        "is_synthetic_source": True,
        "based_on": ["amazon_reviews_2023"],
        "purpose": "week2_demo_m3_bronze_input",
        "selected_option": selected_option,
        "source_files": {
            "reviews": str(review_source),
            "metadata": str(meta_source),
        },
        "sample_size": {
            "amazon_reviews": review_count,
            "amazon_metadata": product_count,
            "behavior_events": behavior_count,
            "taxi_rows": 0,
        },
        "warning": "This is demo synthetic raw. It must not be presented as real production data.",
    }
    write_json(manifest_path, manifest)

    review_summary = summarize_reviews(reviews)
    summary = {
        "files": [
            {
                "path": str(review_path),
                "format": "jsonl",
                **review_summary,
            },
            {
                "path": str(product_path),
                "format": "jsonl",
                "row_count": product_count,
            },
            {
                "path": str(behavior_path),
                "format": "jsonl",
                "row_count": behavior_count,
                "event_types": sorted({row["event_type"] for row in events}),
            },
        ],
        "connector_type": "json",
        "logical_shape": "amazon_reviews_json",
        "data_origin": "demo_synthetic_raw",
        "selected_option": selected_option,
        "synthetic_notice": "demo synthetic raw",
        "known_limitations": [
            "Behavior events are synthetic unless replaced by M4 Kafka output.",
            "Taxi rows are not included in this Amazon Reviews demo sample.",
            "This data must not be presented as real production shopping behavior.",
        ],
    }
    write_json(summary_path, summary)
    return summary


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--category", default="Gift_Cards")
    parser.add_argument("--review-rows", type=int, default=10_000)
    parser.add_argument("--product-rows", type=int, default=1_000)
    parser.add_argument("--events-per-product", type=int, default=3)
    parser.add_argument("--selected-option")
    parser.add_argument("--external-root", type=Path, default=Path("data/external/amazon-reviews-2023"))
    parser.add_argument("--output-root", type=Path, default=Path("data/week2/mvp_synthesis"))
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    summary = generate(args)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
