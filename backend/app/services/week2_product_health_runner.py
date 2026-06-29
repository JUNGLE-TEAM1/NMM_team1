from pathlib import Path
from time import perf_counter
from typing import Any

from app.services.week2_local_runner import Week2RunnerResult, elapsed_ms, path_size


PRODUCT_HEALTH_ROWS: list[dict[str, Any]] = [
    {
        "product_id": "P-001",
        "product_name": "Trail Bottle",
        "category_l1": "Outdoor",
        "review_count": 120,
        "average_rating": 2.1,
        "negative_review_rate": 0.48,
        "view_count": 3000,
        "purchase_count": 90,
        "conversion_rate": 0.03,
        "delivery_count": 82,
        "late_delivery_rate": 0.22,
        "risk_score": 0.87,
    },
    {
        "product_id": "P-002",
        "product_name": "Desk Lamp",
        "category_l1": "Home",
        "review_count": 84,
        "average_rating": 3.0,
        "negative_review_rate": 0.31,
        "view_count": 2200,
        "purchase_count": 176,
        "conversion_rate": 0.08,
        "delivery_count": 155,
        "late_delivery_rate": 0.14,
        "risk_score": 0.61,
    },
    {
        "product_id": "P-003",
        "product_name": "Travel Pouch",
        "category_l1": "Travel",
        "review_count": 52,
        "average_rating": 4.2,
        "negative_review_rate": 0.08,
        "view_count": 1800,
        "purchase_count": 288,
        "conversion_rate": 0.16,
        "delivery_count": 244,
        "late_delivery_rate": 0.04,
        "risk_score": 0.18,
    },
]

PRODUCT_HEALTH_SOURCE_EVIDENCE = [
    {
        "node_id": "node_source_product_reviews",
        "source_id": "reviews_seed",
        "input_path": "handoff://product_health/reviews_seed",
        "row_count": 120,
        "bytes": 8192,
    },
    {
        "node_id": "node_source_behavior_events",
        "source_id": "behavior_events_seed",
        "input_path": "handoff://product_health/behavior_events_seed",
        "row_count": 3000,
        "bytes": 32768,
    },
    {
        "node_id": "node_source_delivery_trips",
        "source_id": "delivery_trips_seed",
        "input_path": "handoff://product_health/delivery_trips_seed",
        "row_count": 244,
        "bytes": 12288,
    },
    {
        "node_id": "node_source_product_master",
        "source_id": "product_master_seed",
        "input_path": "handoff://product_health/product_master_seed",
        "row_count": 3,
        "bytes": 2048,
    },
]


class Week2ProductHealthHandoffRunner:
    """M2/M3 product-health runner가 붙기 전 M5 contract를 고정하는 handoff runner."""

    def __init__(self, output_root: Path) -> None:
        self.output_root = output_root

    def run(
        self,
        workflow_definition: dict[str, Any],
        run_id: str = "run_product_health_demo_001",
    ) -> Week2RunnerResult:
        """고정된 product-health handoff artifact와 source-level evidence를 반환한다."""

        started = perf_counter()
        target_dataset = workflow_definition.get("target_dataset", "dataset_product_health_gold")
        output_path = self.output_root / "product_health" / "gold" / f"run_id={run_id}" / f"{target_dataset}.parquet"

        try:
            write_parquet(PRODUCT_HEALTH_ROWS, output_path)
        except Exception as error:
            return Week2RunnerResult(
                status="failed",
                task_results=[
                    {
                        "node_id": "node_load_product_health_gold",
                        "status": "failed",
                        "attempt": 1,
                        "row_count": None,
                        "bytes": None,
                        "error": str(error),
                    }
                ],
                logs=[{"level": "error", "message": f"product-health handoff fixture failed: {error}"}],
                duration_ms=elapsed_ms(started),
            )

        output_bytes = path_size(output_path)
        task_results = source_task_results(PRODUCT_HEALTH_SOURCE_EVIDENCE)
        task_results.extend(
            [
                succeeded_task_result(
                    "node_materialize_product_health_bronze",
                    row_count=3367,
                    bytes=sum_bytes(PRODUCT_HEALTH_SOURCE_EVIDENCE),
                    output_path=str(self.output_root / "product_health" / "bronze" / f"run_id={run_id}"),
                ),
                succeeded_task_result(
                    "node_materialize_product_health_silver",
                    row_count=3,
                    bytes=output_bytes,
                    output_path=str(self.output_root / "product_health" / "silver" / f"run_id={run_id}"),
                ),
                succeeded_task_result(
                    "node_load_product_health_gold",
                    row_count=len(PRODUCT_HEALTH_ROWS),
                    bytes=output_bytes,
                    output_path=str(output_path),
                ),
            ]
        )

        return Week2RunnerResult(
            status="fallback_succeeded",
            task_results=task_results,
            logs=[
                {"level": "info", "message": "queued"},
                {"level": "info", "message": "running"},
                {"level": "info", "message": "product-health handoff fixture materialized"},
            ],
            row_count=sum(source["row_count"] for source in PRODUCT_HEALTH_SOURCE_EVIDENCE),
            bytes=sum_bytes(PRODUCT_HEALTH_SOURCE_EVIDENCE),
            duration_ms=elapsed_ms(started),
            output_path=str(output_path),
            output_row_count=len(PRODUCT_HEALTH_ROWS),
            output_bytes=output_bytes,
        )


def write_parquet(rows: list[dict[str, Any]], output_path: Path) -> None:
    """handoff row를 Parquet로 저장한다."""

    try:
        import pyarrow as arrow
        import pyarrow.parquet as parquet
    except ImportError as error:
        raise Week2ProductHealthRunnerError("pyarrow is required for product-health handoff fixture") from error

    output_path.parent.mkdir(parents=True, exist_ok=True)
    table = arrow.Table.from_pylist(rows)
    parquet.write_table(table, output_path, compression="snappy")


def source_task_results(sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "node_id": source["node_id"],
            "status": "succeeded",
            "attempt": 1,
            "row_count": source["row_count"],
            "bytes": source["bytes"],
            "error": None,
            "source_id": source["source_id"],
            "input_path": source["input_path"],
        }
        for source in sources
    ]


def succeeded_task_result(node_id: str, row_count: int, bytes: int | None, output_path: str) -> dict[str, Any]:
    return {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": row_count,
        "bytes": bytes,
        "error": None,
        "output_path": output_path,
    }


def sum_bytes(sources: list[dict[str, Any]]) -> int:
    return sum(source["bytes"] for source in sources if source.get("bytes") is not None)


class Week2ProductHealthRunnerError(ValueError):
    pass
