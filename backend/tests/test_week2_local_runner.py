import json
from pathlib import Path

from app.services.week2_local_runner import Week2LocalRunner


def source_config(path: Path) -> dict:
    return {
        "connection_ref": {"path": str(path)},
        "options": {"encoding": "utf-8"},
    }


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("\n".join(json.dumps(row) for row in rows) + "\n", encoding="utf-8")


def test_week2_local_runner_executes_supported_nodes_in_order(tmp_path: Path) -> None:
    source_path = tmp_path / "reviews.jsonl"
    write_jsonl(
        source_path,
        [
            {"review_id": "R1", "product_id": "B1", "rating": 5},
            {"review_id": "R2", "product_id": "B2", "rating": 4},
        ],
    )
    workflow = {
        "nodes": [
            {"id": "node_source", "type": "Source"},
            {"id": "node_load", "type": "Load", "target_dataset": "dataset_reviews_gold"},
        ],
        "edges": [["node_source", "node_load"]],
    }

    result = Week2LocalRunner(source_config=source_config(source_path), output_root=tmp_path / "out").run(workflow)

    assert result.status == "fallback_succeeded"
    assert [task["node_id"] for task in result.task_results] == ["node_source", "node_load"]
    assert [task["status"] for task in result.task_results] == ["succeeded", "succeeded"]
    assert result.row_count == 2
    assert result.output_row_count == 2
    assert result.bytes and result.bytes > 0
    assert result.output_bytes and result.output_bytes > 0
    assert result.task_results[0]["bytes"] == result.bytes
    assert result.task_results[-1]["bytes"] == result.output_bytes
    assert result.node_outputs is not None
    assert [output["node_id"] for output in result.node_outputs] == ["node_source", "node_load"]
    assert result.node_outputs[0]["label"] == "원본 읽기"
    assert result.node_outputs[0]["preview_rows"][0]["review_id"] == "R1"
    assert result.node_outputs[-1]["path"] == result.output_path
    assert result.output_path
    assert Path(result.output_path).exists()
    assert result.logs[-1]["message"] == "fallback_succeeded"


def test_week2_local_runner_fails_unknown_node_type(tmp_path: Path) -> None:
    source_path = tmp_path / "reviews.jsonl"
    write_jsonl(source_path, [{"review_id": "R1", "product_id": "B1", "rating": 5}])
    workflow = {
        "nodes": [
            {"id": "node_source", "type": "Source"},
            {"id": "node_unknown", "type": "Custom"},
        ],
        "edges": [["node_source", "node_unknown"]],
    }

    result = Week2LocalRunner(source_config=source_config(source_path), output_root=tmp_path / "out").run(workflow)

    assert result.status == "fallback_failed"
    assert result.task_results[-1] == {
        "node_id": "node_unknown",
        "status": "failed",
        "attempt": 1,
        "row_count": None,
        "bytes": None,
        "error": "Unsupported node type: Custom",
    }


def test_week2_local_runner_fails_missing_edge_refs() -> None:
    workflow = {
        "nodes": [{"id": "node_source", "type": "Source"}],
        "edges": [["node_source", "node_missing"]],
    }

    result = Week2LocalRunner().run(workflow)

    assert result.status == "fallback_failed"
    assert result.task_results == []
    assert "node_missing" in result.logs[-1]["message"]
