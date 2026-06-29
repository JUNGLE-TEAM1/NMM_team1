from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

from tools.product_health_reference_transform import OUTPUT_COLUMNS, run


def _write_jsonl(path: Path, rows: list[dict[str, object]]) -> None:
    path.write_text("\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n", encoding="utf-8")


def _read_jsonl(path: Path) -> list[dict[str, object]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def test_reference_transform_generates_fixed_product_health_schema_from_mixed_sources(tmp_path: Path) -> None:
    product_master = tmp_path / "product_master.json"
    reviews = tmp_path / "reviews.jsonl"
    behavior = tmp_path / "behavior.csv"
    delivery = tmp_path / "delivery.jsonl"
    output_dir = tmp_path / "out"

    product_master.write_text(
        json.dumps(
            {
                "records": [
                    {"product_id": "P1", "product_name": "Boot", "category_l1": "Shoes"},
                    {"product_id": "P3", "product_name": "Hat", "category_l1": "Accessories"},
                ]
            }
        ),
        encoding="utf-8",
    )
    _write_jsonl(
        reviews,
        [
            {"product_id": "P1", "rating": 5},
            {"product_id": "P1", "rating": 1},
            {"product_id": "P2", "rating": 4, "title": "Review title must not become product name", "product_name": "Fallback product hint", "category": "ReviewOnly"},
            {"rating": 1, "review_text": "Missing product id must be counted as coverage loss"},
        ],
    )
    with behavior.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["product_id", "event_type"])
        writer.writeheader()
        writer.writerows(
            [
                {"product_id": "P1", "event_type": "product_view"},
                {"product_id": "P1", "event_type": "purchase"},
                {"product_id": "P2", "event_type": "purchase"},
            ]
        )
    _write_jsonl(
        delivery,
        [
            {"product_id": "P1", "late_flag": False},
            {"product_id": "P1", "late_flag": True},
            {"product_id": "P2", "late_flag": False},
        ],
    )

    summary = run(
        argparse.Namespace(
            reviews=reviews,
            behavior=behavior,
            delivery=delivery,
            product_master=product_master,
            output_dir=output_dir,
            review_limit=None,
            behavior_limit=None,
            delivery_limit=None,
            product_limit=None,
            output_limit=None,
        )
    )

    rows = {row["product_id"]: row for row in _read_jsonl(output_dir / "gold_product_health.jsonl")}
    coverage = {row["product_id"]: row for row in _read_jsonl(output_dir / "risk_score_coverage.jsonl")}
    csv_header = (output_dir / "gold_product_health.csv").read_text(encoding="utf-8").splitlines()[0].split(",")

    assert summary["output_schema"] == OUTPUT_COLUMNS
    assert summary["m2_runtime_claim"] is False
    assert summary["catalog_ready_claim"] is False
    assert summary["cross_source_identity_guard"]["identity_mapping_approved"] is False
    assert summary["cross_source_identity_guard"]["catalog_ready_without_m5_l9"] is False
    assert summary["join_strategy"] == "full_outer_product_id_union_with_product_master_preferred_dimensions"
    assert summary["full_product_universe_count"] == 3
    assert summary["output_row_limit"] is None
    assert summary["output_truncated"] is False
    assert summary["truncated_product_count"] == 0
    assert summary["input_total_rows_scanned"] == 12
    assert summary["source_level_evidence"]["reviews"]["rows_scanned"] == 4
    assert summary["source_level_evidence"]["reviews"]["product_id_missing_rows"] == 1
    assert summary["source_level_evidence"]["reviews"]["unique_product_ids"] == 2
    assert summary["gold_reduction_interpretation"]["must_not_hide_loss"].startswith("Use source_level_evidence")
    assert csv_header == OUTPUT_COLUMNS
    assert set(rows) == {"P1", "P2", "P3"}

    assert rows["P1"]["review_count"] == 2
    assert rows["P1"]["average_rating"] == 3.0
    assert rows["P1"]["negative_review_rate"] == 0.5
    assert rows["P1"]["view_count"] == 1
    assert rows["P1"]["purchase_count"] == 1
    assert rows["P1"]["conversion_rate"] == 1.0
    assert rows["P1"]["delivery_count"] == 2
    assert rows["P1"]["late_delivery_rate"] == 0.5
    assert 0 <= rows["P1"]["risk_score"] <= 100

    assert rows["P2"]["product_name"] == "Fallback product hint"
    assert rows["P2"]["category_l1"] == "ReviewOnly"
    assert rows["P2"]["view_count"] == 0
    assert rows["P2"]["purchase_count"] == 1
    assert rows["P2"]["conversion_rate"] is None
    assert "low_conversion_score" in coverage["P2"]["missing_components"]

    assert rows["P3"]["review_count"] == 0
    assert rows["P3"]["view_count"] == 0
    assert rows["P3"]["delivery_count"] == 0
    assert rows["P3"]["risk_score"] is None
    assert coverage["P3"]["available_components"] == []


def test_reference_transform_marks_debug_output_truncation(tmp_path: Path) -> None:
    product_master = tmp_path / "product_master.jsonl"
    output_dir = tmp_path / "out"
    _write_jsonl(
        product_master,
        [
            {"product_id": "P1", "product_name": "One"},
            {"product_id": "P2", "product_name": "Two"},
            {"product_id": "P3", "product_name": "Three"},
        ],
    )

    summary = run(
        argparse.Namespace(
            reviews=None,
            behavior=None,
            delivery=None,
            product_master=product_master,
            output_dir=output_dir,
            review_limit=None,
            behavior_limit=None,
            delivery_limit=None,
            product_limit=None,
            output_limit=2,
        )
    )

    rows = _read_jsonl(output_dir / "gold_product_health.jsonl")
    assert len(rows) == 2
    assert summary["full_product_universe_count"] == 3
    assert summary["output_row_limit"] == 2
    assert summary["output_truncated"] is True
    assert summary["truncated_product_count"] == 1
    assert "output_truncated" in summary["gold_reduction_interpretation"]["must_not_hide_loss"]


def test_reference_transform_does_not_treat_review_title_as_product_name(tmp_path: Path) -> None:
    reviews = tmp_path / "reviews.jsonl"
    output_dir = tmp_path / "out"
    _write_jsonl(reviews, [{"parent_asin": "A1", "rating": 5, "title": "Great but this is a review title"}])

    run(
        argparse.Namespace(
            reviews=reviews,
            behavior=None,
            delivery=None,
            product_master=None,
            output_dir=output_dir,
            review_limit=None,
            behavior_limit=None,
            delivery_limit=None,
            product_limit=None,
            output_limit=None,
        )
    )

    rows = _read_jsonl(output_dir / "gold_product_health.jsonl")
    assert rows[0]["product_id"] == "A1"
    assert rows[0]["product_name"] is None


def test_reference_transform_keeps_behavior_only_product_from_nested_unknown_jsonl(tmp_path: Path) -> None:
    behavior = tmp_path / "behavior.jsonl"
    output_dir = tmp_path / "out"
    _write_jsonl(
        behavior,
        [
            {"event_name": "product_impression", "item": {"item_id": "N1", "category_id": "nested-category"}},
            {"event_name": "product_click", "item": {"item_id": "N1", "category_id": "nested-category"}},
        ],
    )

    run(
        argparse.Namespace(
            reviews=None,
            behavior=behavior,
            delivery=None,
            product_master=None,
            output_dir=output_dir,
            review_limit=None,
            behavior_limit=None,
            delivery_limit=None,
            product_limit=None,
            output_limit=None,
        )
    )

    rows = _read_jsonl(output_dir / "gold_product_health.jsonl")
    assert len(rows) == 1
    assert rows[0]["product_id"] == "N1"
    assert rows[0]["category_l1"] == "nested-category"
    assert rows[0]["view_count"] == 1
    assert rows[0]["conversion_rate"] == 0.0
