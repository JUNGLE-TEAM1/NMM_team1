from __future__ import annotations

import json
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]

EXPECTED_PRODUCT_HEALTH_COLUMNS = [
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

EXPECTED_SOURCE_IDS = {
    "source_reviews_seed",
    "source_behavior_events_seed",
    "source_delivery_trips_seed",
    "source_product_master_seed",
}


def _load_contract(name: str) -> dict[str, Any]:
    return json.loads((REPO_ROOT / "contracts" / name).read_text(encoding="utf-8"))


def test_product_health_gold_contract_freezes_schema_and_metric_semantics() -> None:
    contract = _load_contract("product_health_gold_contract.sample.json")

    assert contract["contract"] == "ProductHealthGoldContract"
    assert contract["pipeline_id"] == "pipeline_product_health_e2e"
    assert contract["dataset_id"] == "dataset_product_health_gold"
    assert contract["table_name"] == "gold_product_health"
    assert [field["name"] for field in contract["output_schema"]] == EXPECTED_PRODUCT_HEALTH_COLUMNS
    assert {source["source_id"] for source in contract["source_requirements"]} == EXPECTED_SOURCE_IDS
    assert contract["gold_build_strategy"]["layering"].startswith("bronze_preserve")
    assert "joining raw facts before aggregation and multiplying counts" in contract["gold_build_strategy"]["anti_patterns"]
    assert "dropping review/behavior/delivery products only because product master is missing" in contract["gold_build_strategy"]["anti_patterns"]

    metrics = {metric["metric_id"]: metric for metric in contract["metric_definitions"]}
    for metric_id in ["negative_review_rate", "risk_score", "conversion_rate", "late_delivery_rate"]:
        assert metric_id in metrics
    assert metrics["negative_review_rate"]["zero_denominator_policy"] == "null_when_review_count_is_zero"
    assert metrics["conversion_rate"]["zero_denominator_policy"] == "null_when_view_count_is_zero"
    assert metrics["late_delivery_rate"]["zero_denominator_policy"] == "null_when_delivery_count_is_zero"
    assert metrics["risk_score"]["formula"] == "selected_risk_score_policy(risk_score_policy_ref)"
    assert metrics["risk_score"]["risk_score_policy_ref"] == "contracts/product_health_risk_score_policy.sample.json"
    assert contract["internal_metric_metadata"][0]["name"] == "risk_score_coverage"
    assert contract["claim_boundary"]["m3_does_not_own"].startswith("Spark session/runtime")

    policy = _load_contract("product_health_risk_score_policy.sample.json")
    assert policy["contract"] == "RiskScorePolicyRecommendation"
    assert policy["approval_contract"]["l9_required"] is True
    assert policy["approval_contract"]["legacy_l5_required_before_logical_split"] is True
    assert policy["approval_contract"]["compile_allowed_before_approval"] is False
    assert policy["weight_recommendation_rule"]["mode"] == "source_evidence_adaptive"
    assert policy["weight_recommendation_rule"]["not_global_constant"] is True
    assert policy["weight_guardrails"]["normalization"] == "renormalize_over_available_approved_components"
    assert policy["operation_contract"]["operation"] == "apply_risk_score_policy"
    assert "policy is not L9-approved" in policy["operation_contract"]["block_conditions"]
    assert policy["selection_rule"].startswith("M3 recommends")
    conversion_component = next(component for component in policy["component_registry"] if component["component_id"] == "low_conversion_score")
    assert conversion_component["deterministic_test_fallback_expression"] == "1 - conversion_rate"
    assert any("not a universal production risk formula" in claim for claim in policy["blocked_claims"])
    examples = {item["candidate_id"]: item["formula_template"] for item in policy["candidate_policy_examples"]}
    assert "full_product_health_signal" in examples
    assert "review_only_signal" in examples
    assert "renormalize_missing=true" in examples["review_only_signal"]


def test_product_health_transform_spec_targets_gold_product_health_e2e() -> None:
    spec = _load_contract("product_health_transform_spec.sample.json")

    assert spec["contract"] == "TransformSpec"
    assert spec["pipeline_id"] == "pipeline_product_health_e2e"
    assert spec["target_dataset"] == "dataset_product_health_gold"
    assert spec["target_table"] == "gold_product_health"
    assert spec["semantic_contract_ref"] == "contracts/product_health_gold_contract.sample.json"
    assert spec["risk_score_policy_ref"] == "contracts/product_health_risk_score_policy.sample.json"
    assert spec["catalog_facts"]["output_columns"] == EXPECTED_PRODUCT_HEALTH_COLUMNS
    assert set(spec["catalog_facts"]["source_lineage"]) == EXPECTED_SOURCE_IDS
    assert spec["runtime_evidence_requirements"]["input_total_bytes_minimum_for_presentation"] == 5368709120
    assert spec["runtime_evidence_requirements"]["small_smoke_and_5gb_run_must_share_transform_version"] is True
    assert spec["reference_runner"]["path"] == "tools/product_health_reference_transform.py"
    assert spec["reference_runner"]["m2_runtime_claim"] is False
    assert spec["reference_runner"]["supported_input_formats"] == ["jsonl", "json", "csv"]
    assert spec["reference_runner"]["emits_source_level_evidence"] is True
    assert "product_id_missing_rows" in spec["reference_runner"]["source_level_evidence_fields"]
    assert spec["reference_runner"]["output_limit_default"] == "no_cap"
    assert "output_truncated" in spec["reference_runner"]["debug_output_cap_fields"]
    assert spec["reference_runner"]["catalog_ready_claim"] is False
    assert "source identity mapping is approved" in spec["reference_runner"]["cross_source_identity_guard"]
    assert "silent product_id loss" in spec["reference_runner"]["gold_reduction_guard"]
    assert spec["spark_minio_validation_harness"]["path"] == "tools/product_health_spark_validation.py"
    assert spec["spark_minio_validation_harness"]["m3_core_runtime_claim"] is False
    assert spec["spark_minio_validation_harness"]["input_policy"].startswith("Use bounded source windows")
    assert spec["ownership_constraints"]["m2_owns_runtime_execution"] is True
    join_operation = next(operation for operation in spec["operations"] if operation["id"] == "join_product_health_inputs")
    assert join_operation["join_strategy"] == "full_outer_product_id_union_with_product_master_preferred_dimensions"
    assert join_operation["base"] == "coalesced_product_id_universe"
    derive_operation = next(operation for operation in spec["operations"] if operation["id"] == "calculate_product_health_metrics")
    risk_expression = next(expression for expression in derive_operation["expressions"] if expression["name"] == "risk_score")
    assert risk_expression["operation"] == "apply_risk_score_policy"
    assert risk_expression["approved_policy_required"] is True
    assert risk_expression["operation_contract_ref"] == "contracts/product_health_risk_score_policy.sample.json#/operation_contract"
    assert risk_expression["missing_component_handling"] == "exclude_from_weight_and_record_in_risk_score_coverage"

    operation_ids = {operation["id"] for operation in spec["operations"]}
    assert {
        "aggregate_review_health",
        "aggregate_behavior_health",
        "aggregate_delivery_health",
        "join_product_health_inputs",
        "calculate_product_health_metrics",
        "load_product_health_gold",
    }.issubset(operation_ids)


def test_product_health_catalog_fixture_is_query_ready_for_m6_and_m1() -> None:
    schema = _load_contract("product_health_schema_definition.sample.json")
    catalog = _load_contract("product_health_catalog_metadata.sample.json")
    workflow = _load_contract("product_health_workflow_definition.sample.json")

    assert schema["dataset_id"] == "dataset_product_health_gold"
    assert [field["path"] for field in schema["fields"]] == EXPECTED_PRODUCT_HEALTH_COLUMNS
    assert catalog["dataset_id"] == "dataset_product_health_gold"
    assert catalog["query"]["table_name"] == "gold_product_health"
    assert catalog["query"]["allowed_columns"] == EXPECTED_PRODUCT_HEALTH_COLUMNS
    assert "ORDER BY risk_score DESC" in catalog["query"]["canonical_demo_query"]
    assert set(catalog["lineage"]["source_ids"]) == EXPECTED_SOURCE_IDS
    assert workflow["pipeline_id"] == "pipeline_product_health_e2e"
    assert workflow["target_dataset"] == "dataset_product_health_gold"
    assert workflow["runner"]["primary"] == "spark_runner"
    join_node = next(node for node in workflow["nodes"] if node["id"] == "node_join_and_score")
    assert join_node["config"]["join_strategy"] == "full_outer_product_id_union_with_product_master_preferred_dimensions"


def test_product_health_vector_index_handoff_is_search_help_not_value_evidence() -> None:
    handoff = _load_contract("product_health_vector_index_handoff.sample.json")

    assert handoff["contract"] == "SemanticCatalogVectorIndexHandoff"
    assert handoff["dataset_id"] == "dataset_product_health_gold"
    assert handoff["table_name"] == "gold_product_health"
    assert handoff["m3_embedding_execution"] is False
    assert handoff["execution_owner"] == "M6_or_vector_extension"
    assert "dataset_id" in handoff["payload_filter_keys"]
    assert "metric_id" in handoff["payload_filter_keys"]

    document_types = {document["document_type"] for document in handoff["documents"]}
    assert {"dataset_card", "metric_definition"}.issubset(document_types)
    metric_docs = {document["payload"].get("metric_id") for document in handoff["documents"]}
    assert {"risk_score", "negative_review_rate", "conversion_rate", "late_delivery_rate"}.issubset(metric_docs)
    assert "does_not_improve" in handoff["accuracy_boundary"]
    assert "100GB local data" in handoff["accuracy_boundary"]["100gb_test_role"]
