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


def _write_orders_csv(path: Path) -> None:
    path.write_text(
        "\n".join(
            [
                "order_id,customer_id,amount,order_time,status",
                "o-001,c-001,10.5,2026-06-26T10:00:00Z,paid",
                "o-002,c-002,42.0,2026-06-26T10:05:00Z,paid",
                "o-003,c-003,7.0,2026-06-26T10:10:00Z,cancelled",
            ]
        )
        + "\n",
        encoding="utf-8",
    )


def _write_pretty_json(path: Path) -> None:
    payload = {
        "dataset": "demo",
        "products": [
            {"product_id": "sku-001", "rating": 5, "review_text": "good"},
            {"product_id": "sku-002", "rating": 2, "review_text": "bad"},
        ],
        "metadata": {"created_at": "2026-06-28T00:00:00Z"},
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _write_fake_parquet(path: Path) -> None:
    path.write_bytes(b"PAR1\x15\x04\x15\x10fake parquet bytes for extension routing test\x00\x00PAR1")


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


def _run_csv_contract(tmp_path: Path) -> Path:
    source = tmp_path / "orders.csv"
    out_dir = tmp_path / "contract_orders_csv"
    _write_orders_csv(source)
    command = [
        sys.executable,
        str(REPO_ROOT / "tools" / "m3_contract_cli.py"),
        "--source",
        str(source),
        "--source-id",
        "source_orders_csv",
        "--run-id",
        "run_orders_csv",
        "--output",
        str(out_dir),
        "--format",
        "csv",
        "--sample-rows",
        "50",
        "--gold-decision",
        "deferred",
    ]
    subprocess.run(command, cwd=REPO_ROOT, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return out_dir


def _run_json_contract(tmp_path: Path) -> Path:
    source = tmp_path / "pretty_report.json"
    out_dir = tmp_path / "contract_pretty_json"
    _write_pretty_json(source)
    command = [
        sys.executable,
        str(REPO_ROOT / "tools" / "m3_contract_cli.py"),
        "--source",
        str(source),
        "--source-id",
        "source_pretty_json",
        "--run-id",
        "run_pretty_json",
        "--output",
        str(out_dir),
        "--format",
        "json",
        "--sample-rows",
        "100",
        "--gold-decision",
        "deferred",
    ]
    subprocess.run(command, cwd=REPO_ROOT, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return out_dir


def _run_parquet_contract(tmp_path: Path) -> Path:
    source = tmp_path / "taxi_window.parquet"
    out_dir = tmp_path / "contract_parquet"
    _write_fake_parquet(source)
    command = [
        sys.executable,
        str(REPO_ROOT / "tools" / "m3_contract_cli.py"),
        "--source",
        str(source),
        "--source-id",
        "source_taxi_parquet",
        "--run-id",
        "run_taxi_parquet",
        "--output",
        str(out_dir),
        "--format",
        "auto",
        "--sample-rows",
        "10",
        "--sample-bytes",
        "1024",
        "--gold-decision",
        "not_requested",
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

    run_summary = _load(out_dir / "run_summary.json")
    assert run_summary["layer_contract_version"] == "m3.logical_layers.v3_l0_l16"
    assert [item["new_layers"] for item in run_summary["split_summary"] if item["old_layer"] == "L3"][0] == ["L3", "L4", "L5"]
    assert [item["new_layers"] for item in run_summary["split_summary"] if item["old_layer"] == "L4"][0] == ["L6", "L7", "L8"]
    assert [item["new_layers"] for item in run_summary["split_summary"] if item["old_layer"] == "L6"][0] == ["L10", "L11", "L12"]
    logical_layers = {item["layer"]: item for item in run_summary["logical_layers"]}
    assert {"L0", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L16"}.issubset(logical_layers)
    assert logical_layers["L16"]["handoff_to"] == "M5 catalog/workflow storage and M6 query context"

    l0_manifest = _load(out_dir / "l0" / "object_stream_manifest.json")
    assert l0_manifest["logical_layer"] == "L0"
    assert l0_manifest["source_units"]
    assert l0_manifest["objects"][0]["source_unit_id"] == l0_manifest["source_units"][0]["source_unit_id"]

    l2_profile = _load(out_dir / "l2" / "profile_snapshot.json")
    assert l2_profile["data_shape_contract"]["structure_class"] == "semi_structured_records"
    assert l2_profile["data_shape_contract"]["bounded_evidence"]["full_data_scan_by_m3"] is False
    assert l2_profile["data_shape_contract"]["streaming_bigdata_contract"]["per_event_ai_policy"] == "forbidden"

    l3_input = _load(out_dir / "l3" / "ai_recommendation_input_pack.json")
    assert l3_input["logical_layer"] == "L3"
    assert l3_input["forbidden_raw_payload"] is True
    assert l3_input["row_level_ai_calls"] == 0
    assert l3_input["source_processing_contract"]["m3_processing_role"] == "control_plane_only"
    l3_unknown = _load(out_dir / "l3" / "unknown_data_recommendation_pack.json")
    assert l3_unknown["recommendation_mode"] == "unknown_data_general"
    assert "presentation_product_health_template" in [item["target"] for item in l3_unknown["generic_recommendation_targets"]]
    l3_index_plan = _load(out_dir / "l3" / "metadata_retrieval_index_plan.json")
    assert l3_index_plan["logical_layer"] == "L4"
    assert l3_index_plan["layer"] == "L4"
    assert l3_index_plan["legacy_layer"] == "L3A"
    assert l3_index_plan["artifact_type"] == "metadata_retrieval_index_plan"
    assert l3_index_plan["m3_embedding_execution"] is False
    assert "raw rows" in l3_index_plan["blocked_inputs"]
    assert {"schema_profile", "column_profile", "gold_template"}.issubset({item["document_type"] for item in l3_index_plan["documents"]})
    l3_template_retrieval = _load(out_dir / "l3" / "gold_template_candidate_retrieval.json")
    assert l3_template_retrieval["logical_layer"] == "L4"
    assert l3_template_retrieval["legacy_layer"] == "L3B"
    candidate = l3_template_retrieval["template_candidates"][0]
    assert candidate["template_id"] == "gold_product_health_v1"
    assert "conversion numerator and denominator" in candidate["missing_or_weak_evidence"]
    l3_grounding = _load(out_dir / "l3" / "candidate_grounding_report.json")
    assert l3_grounding["logical_layer"] == "L5"
    assert l3_grounding["legacy_layer"] == "L3C"
    grounded = l3_grounding["candidate_outputs"][0]["metric_grounding"]
    assert l3_grounding["candidate_outputs"][0]["allowed_to_l10_l11_compile_without_l9"] is False
    assert grounded["negative_review_rate"] == "candidate"
    assert grounded["risk_score"] == "policy_recommendation_candidate"
    assert grounded["conversion_rate"] == "needs_source_evidence"
    assert grounded["late_delivery_rate"] == "needs_source_evidence"

    product_health_template = _load(out_dir / "l4" / "product_health_gold_template_draft.json")
    assert product_health_template["logical_layer"] == "L7"
    assert product_health_template["layer"] == "L7"
    assert product_health_template["template_id"] == "gold_product_health"
    assert product_health_template["compile_allowed_by_default"] is False
    assert product_health_template["candidate_grounding_report_ref"].endswith("_l3_candidate_grounding_report")
    metrics = {item["metric_id"]: item for item in product_health_template["gold_model"]["metric_templates"]}
    assert {"negative_review_rate", "risk_score", "conversion_rate", "late_delivery_rate"}.issubset(metrics)
    assert metrics["negative_review_rate"]["status"] == "candidate"
    assert metrics["risk_score"]["status"] == "policy_recommendation_ready"
    assert metrics["risk_score"]["formula_template"] == "selected_risk_score_policy(risk_score_policy_recommendation_ref)"
    assert metrics["conversion_rate"]["status"] == "needs_source_evidence"
    assert metrics["late_delivery_rate"]["status"] == "needs_source_evidence"
    assert "M3 does not invent conversion_rate from review-only data." in product_health_template["blocked_runtime_claims"]
    risk_policy = _load(out_dir / "l4" / "risk_score_policy_recommendation_draft.json")
    assert risk_policy["logical_layer"] == "L7"
    assert risk_policy["policy_target"] == "gold_product_health.risk_score"
    assert risk_policy["recommendation_source"]["row_level_ai_calls"] == 0
    assert risk_policy["recommended_policy"]["policy_status"] == "draft_recommended"
    assert risk_policy["recommended_policy"]["weight_recommendation_mode"] == "source_evidence_adaptive"
    assert risk_policy["recommended_policy"]["weight_guardrails"]["normalization"] == "renormalize_over_available_approved_components"
    assert set(risk_policy["recommended_policy"]["recommended_weights"]) == {"negative_review_rate", "low_rating_score"}
    assert risk_policy["recommended_policy"]["recommended_weights"]["negative_review_rate"] > risk_policy["recommended_policy"]["recommended_weights"]["low_rating_score"]
    assert "conversion numerator and denominator for low_conversion_score" in risk_policy["recommended_policy"]["missing_or_deferred_components"]

    vector_handoff = _load(out_dir / "l4" / "vector_embedding_handoff_template.json")
    assert vector_handoff["logical_layer"] == "L8"
    assert vector_handoff["handoff_id"] == "vector_embedding_handoff"
    assert vector_handoff["m3_embedding_execution"] is False
    assert vector_handoff["execution_owner"] == "M6_or_vector_extension"

    l5_approval = _load(out_dir / "l5" / "approval_state.json")
    assert l5_approval["logical_layer"] == "L9"
    assert l5_approval["silver"]["compile_allowed"] is True
    assert l5_approval["gold"]["decision_status"] == gold_decision
    assert l5_approval["gold"]["compile_allowed"] is False
    assert l5_approval["gold_to_gold"]["decision_status"] == "not_requested"
    assert l5_approval["product_health_gold_template"]["decision_status"] == "deferred"
    assert l5_approval["product_health_gold_template"]["compile_allowed"] is False
    assert l5_approval["risk_score_policy"]["decision_status"] == "deferred"
    assert l5_approval["risk_score_policy"]["compile_allowed"] is False
    assert l5_approval["vector_embedding_handoff"]["handoff_allowed"] is False

    silver_spec = _load(out_dir / "l6" / "silver_transform_spec.json")
    gold_spec = _load(out_dir / "l6" / "gold_generation_spec.json")
    graph = _load(out_dir / "l6" / "layered_transform_graph.json")
    assert silver_spec["logical_layer"] == "L10"
    assert gold_spec["logical_layer"] == "L11"
    assert graph["logical_layer"] == "L12"
    assert [node["layer"] for node in graph["nodes"]] == [f"L{index}" for index in range(17)]
    assert silver_spec["write_mode"] == "preview_only"
    assert gold_spec["write_mode"] == "preview_only"
    assert gold_spec["request_state"] == gold_decision
    _assert_no_legacy_window_id(silver_spec["preview_scope"])
    _assert_no_legacy_window_id(gold_spec["preview_scope"])

    l9_gate = _load(out_dir / "l9" / "gate_summary.json")
    l9_gold = _load(out_dir / "l9" / "gold_readiness_axis.json")
    assert l9_gate["logical_layer"] == "L15"
    assert l9_gold["logical_layer"] == "L15"
    assert l9_gold["axis_status"] == expected_gold_axis
    assert l9_gate["m6_context_status"]["silver_context_status"] in {"ready", "ready_with_caveat"}
    assert l9_gate["m6_context_status"]["gold_context_status"] == expected_gold_context

    l10_package = _load(out_dir / "l10" / "catalog_sync_contract_package.json")
    l10_sql = _load(out_dir / "l10" / "sql_context_pack.json")
    assert l10_package["logical_layer"] == "L16"
    assert l10_sql["logical_layer"] == "L16"
    assert l10_package["m6_context_status"] == l9_gate["m6_context_status"]
    assert l10_sql["m6_context_status"] == l9_gate["m6_context_status"]
    assert "product_health_gold_template_ref" in l10_package["refs"]
    assert "vector_embedding_handoff_template_ref" in l10_sql["semantic_template_refs"]
    assert "semantic_catalog_vector_index_template_ref" in l10_package["refs"]
    vector_index = _load(out_dir / "l10" / "semantic_catalog_vector_index_template.json")
    assert vector_index["logical_layer"] == "L16"
    assert vector_index["index_intent"] == "schema_metric_catalog_retrieval"
    assert vector_index["m3_embedding_execution"] is False
    assert "dataset_id" in vector_index["payload_filter_keys"]
    assert "numeric correctness" in vector_index["accuracy_boundary"]["does_not_improve"]

    _assert_artifact_refs_resolve(out_dir)

    assert _load(out_dir / "exports" / "transform_spec.json")["contract"] == "TransformSpec"
    assert _load(out_dir / "exports" / "schema_definition.json")["contract"] == "SchemaDefinition"
    assert _load(out_dir / "exports" / "workflow_definition.json")["contract"] == "WorkflowDefinition"
    assert _load(out_dir / "exports" / "catalog_metadata.json")["contract"] == "CatalogMetadata"


def test_m3_v211_csv_orders_are_not_misclassified_as_product_health(tmp_path: Path) -> None:
    out_dir = _run_csv_contract(tmp_path)

    l2_profile = _load(out_dir / "l2" / "profile_snapshot.json")
    assert l2_profile["format_detection"]["format"] == "csv"
    assert l2_profile["data_shape_contract"]["structure_class"] == "structured_table"
    assert l2_profile["data_shape_contract"]["bounded_evidence"]["ai_data_plane_allowed"] is False

    l3_template_retrieval = _load(out_dir / "l3" / "gold_template_candidate_retrieval.json")
    candidate = l3_template_retrieval["template_candidates"][0]
    assert candidate["applicability_status"] == "needs_source_evidence"
    assert candidate["matched_fields"]["product_key"] == []
    assert candidate["matched_fields"]["rating"] == []
    assert "product/entity key" in candidate["missing_or_weak_evidence"]
    assert "rating or review text" in candidate["missing_or_weak_evidence"]

    l3_grounding = _load(out_dir / "l3" / "candidate_grounding_report.json")
    output = l3_grounding["candidate_outputs"][0]
    assert output["allowed_to_l4_draft"] is False
    assert output["metric_grounding"] == {
        "negative_review_rate": "needs_source_evidence",
        "risk_score": "needs_source_evidence",
        "conversion_rate": "needs_source_evidence",
        "late_delivery_rate": "needs_source_evidence",
    }

    product_health_template = _load(out_dir / "l4" / "product_health_gold_template_draft.json")
    assert product_health_template["gold_model"]["entity_grain"] == []
    metrics = {item["metric_id"]: item for item in product_health_template["gold_model"]["metric_templates"]}
    assert metrics["negative_review_rate"]["status"] == "needs_source_evidence"
    assert metrics["risk_score"]["status"] == "needs_source_evidence"
    assert metrics["conversion_rate"]["status"] == "needs_source_evidence"
    assert metrics["late_delivery_rate"]["status"] == "needs_source_evidence"

    risk_policy = _load(out_dir / "l4" / "risk_score_policy_recommendation_draft.json")
    assert risk_policy["recommended_policy"]["policy_status"] == "needs_source_evidence"
    assert risk_policy["recommended_policy"]["recommended_weights"] == {}


def test_m3_v211_pretty_json_is_profiled_as_document_not_jsonl_errors(tmp_path: Path) -> None:
    out_dir = _run_json_contract(tmp_path)

    l2_profile = _load(out_dir / "l2" / "profile_snapshot.json")
    assert l2_profile["format_detection"]["format"] == "json"
    assert l2_profile["parser_stats"]["json_mode"] == "document"
    assert l2_profile["parser_stats"]["parse_errors"] == 0
    assert l2_profile["field_count"] >= 4
    assert l2_profile["data_shape_contract"]["structure_class"] == "semi_structured_records"

    field_names = {field["name"] for field in l2_profile["fields"]}
    assert "$.products" in field_names
    assert "$.products[].product_id" in field_names
    assert "$.products[].rating" in field_names


def test_m3_v211_parquet_is_routed_to_extension_profile_contract(tmp_path: Path) -> None:
    out_dir = _run_parquet_contract(tmp_path)

    l2_profile = _load(out_dir / "l2" / "profile_snapshot.json")
    assert l2_profile["format_detection"]["format"] == "parquet"
    assert l2_profile["data_shape_contract"]["structure_class"] == "extension_required"
    assert l2_profile["data_shape_contract"]["core_support_status"] == "m2_or_extension_profile_required"
    assert l2_profile["data_shape_contract"]["format_handling_matrix"]["parquet"].startswith("not parsed natively")

    run_summary = _load(out_dir / "run_summary.json")
    assert run_summary["layer_contract_version"] == "m3.logical_layers.v3_l0_l16"
    assert run_summary["data_shape_contract"]["declared_or_detected_format"] == "parquet"
    assert run_summary["data_shape_contract"]["bounded_evidence"]["full_data_scan_by_m3"] is False


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
