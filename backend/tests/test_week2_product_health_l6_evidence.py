import argparse
import json
from pathlib import Path

import pyarrow.parquet as pq

from scripts.week2_m2_product_health_l6_evidence import run_evidence


def write_jsonl(path: Path, rows: list[dict]) -> None:
    """테스트용 JSONL 입력 파일을 만든다."""

    path.write_text("\n".join(json.dumps(row) for row in rows) + "\n", encoding="utf-8")


def test_product_health_l6_evidence_creates_gold_preview_and_sql_check(tmp_path: Path) -> None:
    """작은 Product Health 입력이 L6 Gold preview와 SQL 검산까지 이어지는지 확인한다."""

    input_root = tmp_path / "raw"
    output_root = tmp_path / "results"
    input_root.mkdir()
    reviews = input_root / "reviews.jsonl"
    behavior = input_root / "behavior.jsonl"
    delivery = input_root / "delivery.jsonl"
    products = input_root / "products.jsonl"
    spec = input_root / "gold_spec.json"
    write_jsonl(
        reviews,
        [
            {"review_id": "R1", "product_id": "B1", "rating": 2},
            {"review_id": "R2", "product_id": "B1", "rating": 4},
            {"review_id": "R3", "product_id": "B2", "rating": 5},
        ],
    )
    write_jsonl(behavior, [{"event_id": "E1", "product_id": "B1", "event_type": "view"}])
    write_jsonl(delivery, [{"trip_id": "T1", "product_id": "B1", "late_minutes": 10}])
    write_jsonl(products, [{"product_id": "B1", "category": "gift_cards"}])
    spec.write_text(
        json.dumps(
            {
                "artifact_type": "gold_generation_spec",
                "request_state": "approved",
                "write_mode": "preview_only",
                "operations": [
                    {
                        "operation_id": "aggregate_product_review_health",
                        "operation": "aggregate",
                        "params": {
                            "group_by": ["product_id"],
                            "measures": [
                                {"name": "review_count", "operation": "count", "field": "*"},
                                {"name": "average_rating", "operation": "avg", "field": "rating"},
                            ],
                            "time_window": {"enabled": False, "field": None, "window": None},
                            "cardinality_guard": {"max_groups": 10, "on_exceed": "block_preview"},
                        },
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    args = argparse.Namespace(
        reviews=reviews,
        behavior=behavior,
        delivery=delivery,
        products=products,
        transform_spec_path=spec,
        output_root=output_root,
        run_id="run_product_health_l6_test_001",
    )

    evidence = run_evidence(args)

    output_path = output_root / "l6_preview" / "run_id=run_product_health_l6_test_001" / "gold_product_health.parquet"
    rows = sorted(pq.read_table(output_path).to_pylist(), key=lambda row: row["product_id"])
    assert evidence["status"] == "succeeded"
    assert evidence["inputs"]["input_total_rows"] == 6
    assert evidence["l6_preview"]["output_row_count"] == 2
    assert evidence["sql_check"]["status"] == "succeeded"
    assert evidence["sql_check"]["row_count"] == 2
    assert [
        {key: row[key] for key in ["product_id", "review_count", "average_rating"]}
        for row in rows
    ] == [
        {"product_id": "B1", "review_count": 2, "average_rating": 3.0},
        {"product_id": "B2", "review_count": 1, "average_rating": 5.0},
    ]
