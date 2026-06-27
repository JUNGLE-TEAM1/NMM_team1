from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

import pytest


REPO_ROOT = Path(__file__).resolve().parents[1]


def _write_jsonl(path: Path) -> None:
    rows = [
        {
            "review_id": "r-001",
            "product_id": "sku-001",
            "rating": 5,
            "price_total": 32.5,
            "review_time": "2026-06-26T10:00:00Z",
            "customer_email": "user1@example.test",
            "review_text": "good fit",
        },
        {
            "review_id": "r-002",
            "product_id": "sku-001",
            "rating": 4,
            "price_total": 20.0,
            "review_time": "2026-06-26T11:00:00Z",
            "customer_email": "user2@example.test",
            "review_text": "fast shipping",
        },
        {
            "review_id": "r-003",
            "product_id": "sku-002",
            "rating": None,
            "price_total": 10.0,
            "review_time": "2026-06-27T09:00:00Z",
            "customer_email": "user3@example.test",
            "review_text": "needs review",
        },
    ]
    path.write_text("\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n", encoding="utf-8")


def _run_contract(tmp_path: Path, gold_decision: str) -> Path:
    source = tmp_path / f"reviews_{gold_decision}.jsonl"
    out_dir = tmp_path / f"contract_{gold_decision}"
    _write_jsonl(source)
    command = [
        sys.executable,
        str(REPO_ROOT / "tools" / "m3_contract_cli.py"),
        "--source",
        str(source),
        "--source-id",
        f"source_{gold_decision}",
        "--run-id",
        f"run_{gold_decision}",
        "--output",
        str(out_dir),
        "--format",
        "jsonl",
        "--sample-rows",
        "50",
        "--gold-decision",
        gold_decision,
    ]
    subprocess.run(command, cwd=REPO_ROOT, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return out_dir


def _load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _walk(value: Any) -> list[tuple[str, Any]]:
    pairs: list[tuple[str, Any]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            pairs.append((key, child))
            pairs.extend(_walk(child))
    elif isinstance(value, list):
        for child in value:
            pairs.extend(_walk(child))
    return pairs


def _assert_artifact_refs_resolve(out_dir: Path) -> None:
    manifest = _load(out_dir / "l10" / "artifact_reference_manifest.json")
    artifact_ids = {item["artifact_id"] for item in manifest["artifacts"]}
    artifact_ids.add(manifest["artifact_header"]["artifact_id"])
    unresolved: list[tuple[Path, str, Any]] = []
    null_refs: list[tuple[Path, str]] = []
    for path in sorted(out_dir.rglob("*.json")):
        data = _load(path)
        for key, value in _walk(data):
            if not key.endswith("_ref"):
                continue
            if value is None:
                null_refs.append((path.relative_to(out_dir), key))
                continue
            if key == "input_ref" and isinstance(value, str) and not value.startswith("artifact_"):
                continue
            if isinstance(value, str) and value.startswith("artifact_") and value not in artifact_ids:
                unresolved.append((path.relative_to(out_dir), key, value))
    assert null_refs == []
    assert unresolved == []


def _assert_no_legacy_window_id(value: Any) -> None:
    if isinstance(value, dict):
        assert "window_id" not in value
        for child in value.values():
            _assert_no_legacy_window_id(child)
    elif isinstance(value, list):
        for child in value:
            _assert_no_legacy_window_id(child)


@pytest.mark.parametrize(
    ("gold_decision", "expected_gold_axis", "expected_gold_context"),
    [
        ("deferred", "deferred", "not_ready"),
        ("not_requested", "not_requested", "not_requested"),
    ],
)
def test_m3_v211_inactive_gold_contract_is_resolvable_and_silver_safe(
    tmp_path: Path,
    gold_decision: str,
    expected_gold_axis: str,
    expected_gold_context: str,
) -> None:
    out_dir = _run_contract(tmp_path, gold_decision)

    l0_manifest = _load(out_dir / "l0" / "object_stream_manifest.json")
    assert l0_manifest["source_units"]
    assert l0_manifest["objects"][0]["source_unit_id"] == l0_manifest["source_units"][0]["source_unit_id"]

    l3_input = _load(out_dir / "l3" / "ai_recommendation_input_pack.json")
    assert l3_input["forbidden_raw_payload"] is True
    assert l3_input["row_level_ai_calls"] == 0

    l5_approval = _load(out_dir / "l5" / "approval_state.json")
    assert l5_approval["silver"]["compile_allowed"] is True
    assert l5_approval["gold"]["decision_status"] == gold_decision
    assert l5_approval["gold"]["compile_allowed"] is False
    assert l5_approval["gold_to_gold"]["decision_status"] == "not_requested"

    silver_spec = _load(out_dir / "l6" / "silver_transform_spec.json")
    gold_spec = _load(out_dir / "l6" / "gold_generation_spec.json")
    assert silver_spec["write_mode"] == "preview_only"
    assert gold_spec["write_mode"] == "preview_only"
    assert gold_spec["request_state"] == gold_decision
    _assert_no_legacy_window_id(silver_spec["preview_scope"])
    _assert_no_legacy_window_id(gold_spec["preview_scope"])

    l9_gate = _load(out_dir / "l9" / "gate_summary.json")
    l9_gold = _load(out_dir / "l9" / "gold_readiness_axis.json")
    assert l9_gold["axis_status"] == expected_gold_axis
    assert l9_gate["m6_context_status"]["silver_context_status"] in {"ready", "ready_with_caveat"}
    assert l9_gate["m6_context_status"]["gold_context_status"] == expected_gold_context

    l10_package = _load(out_dir / "l10" / "catalog_sync_contract_package.json")
    l10_sql = _load(out_dir / "l10" / "sql_context_pack.json")
    assert l10_package["m6_context_status"] == l9_gate["m6_context_status"]
    assert l10_sql["m6_context_status"] == l9_gate["m6_context_status"]

    _assert_artifact_refs_resolve(out_dir)

    assert _load(out_dir / "exports" / "transform_spec.json")["contract"] == "TransformSpec"
    assert _load(out_dir / "exports" / "schema_definition.json")["contract"] == "SchemaDefinition"
    assert _load(out_dir / "exports" / "workflow_definition.json")["contract"] == "WorkflowDefinition"
    assert _load(out_dir / "exports" / "catalog_metadata.json")["contract"] == "CatalogMetadata"


def test_m3_v211_approved_gold_uses_structured_aggregate_params(tmp_path: Path) -> None:
    out_dir = _run_contract(tmp_path, "approved")
    gold_spec = _load(out_dir / "l6" / "gold_generation_spec.json")
    aggregate_ops = [item for item in gold_spec["operations"] if item["operation"] == "aggregate"]

    assert aggregate_ops
    params = aggregate_ops[0]["params"]
    assert set(params) == {"input_ref", "group_by", "dimensions", "measures", "time_window", "cardinality_guard"}
    assert params["input_ref"] == "silver_preview"
    assert isinstance(params["group_by"], list)
    assert isinstance(params["dimensions"], list)
    assert isinstance(params["measures"], list)
    assert params["cardinality_guard"]["on_exceed"] == "block_preview"

    l9_gate = _load(out_dir / "l9" / "gate_summary.json")
    assert l9_gate["m6_context_status"]["silver_context_status"] in {"ready", "ready_with_caveat"}
    assert l9_gate["m6_context_status"]["gold_context_status"] in {"ready", "ready_with_caveat"}
    _assert_artifact_refs_resolve(out_dir)
