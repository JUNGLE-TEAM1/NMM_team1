from app.services.week2_local_runner import Week2LocalRunner


def test_week2_local_runner_executes_supported_nodes_in_order() -> None:
    workflow = {
        "nodes": [
            {"id": "node_source", "type": "Source"},
            {"id": "node_load", "type": "Load"},
        ],
        "edges": [["node_source", "node_load"]],
    }

    result = Week2LocalRunner().run(workflow)

    assert result.status == "fallback_succeeded"
    assert [task["node_id"] for task in result.task_results] == ["node_source", "node_load"]
    assert [task["status"] for task in result.task_results] == ["succeeded", "succeeded"]
    assert result.logs[-1]["message"] == "fallback_succeeded"


def test_week2_local_runner_fails_unknown_node_type() -> None:
    workflow = {
        "nodes": [
            {"id": "node_source", "type": "Source"},
            {"id": "node_unknown", "type": "Custom"},
        ],
        "edges": [["node_source", "node_unknown"]],
    }

    result = Week2LocalRunner().run(workflow)

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
