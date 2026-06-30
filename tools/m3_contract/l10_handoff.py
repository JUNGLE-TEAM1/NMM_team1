from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, file_sha256, with_header, write_json
from .layer_map import LOGICAL_LAYER_VERSION


def build_l10(
    out_dir: Path,
    source_id: str,
    run_id: str,
    profile: dict[str, Any],
    l5: dict[str, Any],
    l6: dict[str, Any],
    l8: dict[str, Any],
    l9: dict[str, Any],
) -> dict[str, Any]:
    """Package M3 outputs for M5 Catalog and M6 query context."""

    layer_dir = out_dir / "l10"
    ensure_dir(layer_dir)
    m6_context_status = l9["gate_summary"]["m6_context_status"]
    allowed_columns = _allowed_columns(l5)
    metrics = l8["metric_definition"]["metrics"] if m6_context_status["gold_context_status"] in {"ready", "ready_with_caveat"} else []
    catalog = _catalog_metadata(source_id, run_id, profile, l5, l9, m6_context_status)
    sql_context = _sql_context(source_id, run_id, allowed_columns, metrics, l9, m6_context_status)
    lineage = _field_lineage(source_id, run_id, l5)
    contract_package = _catalog_sync_package(source_id, run_id, m6_context_status, bool(metrics))
    semantic_vector_template = _semantic_catalog_vector_index_template(source_id, run_id, catalog, sql_context, m6_context_status)

    write_json(layer_dir / "catalog_metadata_draft.json", catalog)
    write_json(layer_dir / "sql_context_pack.json", sql_context)
    write_json(layer_dir / "field_level_lineage.json", lineage)
    write_json(layer_dir / "catalog_sync_contract_package.json", contract_package)
    write_json(layer_dir / "semantic_catalog_vector_index_template.json", semantic_vector_template)
    artifact_manifest = _artifact_reference_manifest(out_dir, source_id, run_id)
    write_json(layer_dir / "artifact_reference_manifest.json", artifact_manifest)
    handoff = with_header(
        layer="l10",
        name="handoff_package",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l10.handoff_package.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L16",
            "artifact_type": "handoff_package",
            "catalog_sync_contract_package_ref": artifact_ref("l10", "catalog_sync_contract_package", source_id, run_id),
            "catalog_metadata_ref": artifact_ref("l10", "catalog_metadata_draft", source_id, run_id),
            "sql_context_ref": artifact_ref("l10", "sql_context_pack", source_id, run_id),
            "semantic_catalog_vector_index_template_ref": artifact_ref("l10", "semantic_catalog_vector_index_template", source_id, run_id),
            "artifact_reference_manifest_ref": artifact_ref("l10", "artifact_reference_manifest", source_id, run_id),
            "m6_context_status": m6_context_status,
        },
    )
    write_json(layer_dir / "handoff_package.json", handoff)
    artifact_manifest = _artifact_reference_manifest(out_dir, source_id, run_id)
    write_json(layer_dir / "artifact_reference_manifest.json", artifact_manifest)
    export_dir = out_dir / "exports"
    ensure_dir(export_dir)
    transform_spec = export_transform_spec(source_id, run_id, l5, l6, metrics)
    schema_definition = export_schema_definition(source_id, run_id, l5)
    workflow_definition = export_workflow_definition(source_id, run_id, l5, bool(metrics))
    catalog_export = export_catalog_metadata(source_id, run_id, catalog, sql_context)
    write_json(export_dir / "transform_spec.json", transform_spec)
    write_json(export_dir / "schema_definition.json", schema_definition)
    write_json(export_dir / "workflow_definition.json", workflow_definition)
    write_json(export_dir / "catalog_metadata.json", catalog_export)
    return {
        "catalog": catalog,
        "sql_context": sql_context,
        "lineage": lineage,
        "catalog_sync_package": contract_package,
        "semantic_vector_template": semantic_vector_template,
        "artifact_manifest": artifact_manifest,
        "handoff": handoff,
        "exports": {
            "transform_spec": transform_spec,
            "schema_definition": schema_definition,
            "workflow_definition": workflow_definition,
            "catalog_metadata": catalog_export,
        },
    }


def _allowed_columns(l5: dict[str, Any]) -> list[dict[str, Any]]:
    columns = []
    for field in l5["silver_decision"]["fields"]:
        if field["query_context_exposure"] == "forbidden":
            continue
        columns.append(
            {
                "table": "silver_preview",
                "column": field["target_name"],
                "source_path": field["source_path"],
                "data_type": field["target_type"],
                "semantic_description": "Profile-derived Silver field.",
                "pii_handling": field["pii_handling"],
                "catalog_exposure": field["catalog_exposure"],
                "query_context_exposure": field["query_context_exposure"],
            }
        )
    return columns


def _catalog_metadata(
    source_id: str,
    run_id: str,
    profile: dict[str, Any],
    l5: dict[str, Any],
    l9: dict[str, Any],
    m6_context_status: dict[str, str],
) -> dict[str, Any]:
    gold_layer_status = _gold_layer_status(l5["gold_decision"]["decision_status"], m6_context_status["gold_context_status"])
    return with_header(
        layer="l10",
        name="catalog_metadata_draft",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l10.catalog_metadata.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L16",
            "artifact_type": "catalog_metadata_draft",
            "publish_decision": {
                "catalog_public_allowed": m6_context_status["silver_context_status"] in {"ready", "ready_with_caveat"},
                "reason": "Derived from L15 processing and catalog safety axes.",
                "decided_by_axis_ref": artifact_ref("l9", "gate_summary", source_id, run_id),
            },
            "dataset_id": f"dataset_{source_id}_silver",
            "dataset_name": f"{source_id} Silver",
            "source_format": profile["format_detection"]["format"],
            "data_shape_contract": profile.get("data_shape_contract", {}),
            "layers": [
                {"name": "bronze", "status": "available"},
                {"name": "silver", "status": "available" if m6_context_status["silver_context_status"] != "blocked" else "blocked"},
                {"name": "gold", "status": gold_layer_status},
            ],
            "quality": {
                "processing_quality": l9["processing_axis"]["axis_status"],
                "catalog_safety": l9["catalog_axis"]["axis_status"],
                "gold_readiness": l9["gold_axis"]["axis_status"],
            },
            "semantic_templates": [
                {
                    "template_id": "gold_product_health",
                    "template_ref": artifact_ref("l4", "product_health_gold_template_draft", source_id, run_id),
                    "status": "draft_deferred",
                    "catalog_claim": "template_available_not_executed",
                },
                {
                    "template_id": "vector_embedding_handoff",
                    "template_ref": artifact_ref("l4", "vector_embedding_handoff_template", source_id, run_id),
                    "status": "draft_deferred",
                    "catalog_claim": "handoff_template_available_not_indexed",
                },
            ],
            "caveats": l9["gate_summary"]["required_caveats"],
            "lineage_ref": artifact_ref("l10", "field_level_lineage", source_id, run_id),
            "sql_context_ref": artifact_ref("l10", "sql_context_pack", source_id, run_id),
        },
    )


def _sql_context(
    source_id: str,
    run_id: str,
    allowed_columns: list[dict[str, Any]],
    metrics: list[dict[str, Any]],
    l9: dict[str, Any],
    m6_context_status: dict[str, str],
) -> dict[str, Any]:
    caveats = list(l9["gate_summary"]["required_caveats"])
    if m6_context_status["gold_context_status"] == "not_requested":
        caveats.append("Gold layer not requested or not ready")
    elif m6_context_status["gold_context_status"] == "not_ready":
        caveats.append("Gold layer deferred or not ready")
    return with_header(
        layer="l10",
        name="sql_context_pack",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l10.sql_context_pack.v2_1_1",
        access_class="query_context_safe",
        body={
            "layer": "L16",
            "artifact_type": "sql_context_pack",
            "m6_context_status": m6_context_status,
            "allowed_tables": ["silver_preview"] + (["gold_preview"] if metrics else []),
            "allowed_columns": allowed_columns,
            "metrics": metrics,
            "semantic_template_refs": {
                "product_health_gold_template_ref": artifact_ref("l4", "product_health_gold_template_draft", source_id, run_id),
                "vector_embedding_handoff_template_ref": artifact_ref("l4", "vector_embedding_handoff_template", source_id, run_id),
            },
            "forbidden_fields": [],
            "freshness": {"latest_processed_at": None, "freshness_sla": None, "stale_warning": None},
            "query_caveats": caveats,
            "quality_axis_refs": {
                "processing_quality_axis_ref": artifact_ref("l9", "processing_quality_axis", source_id, run_id),
                "catalog_safety_axis_ref": artifact_ref("l9", "catalog_safety_axis", source_id, run_id),
                "gold_readiness_axis_ref": artifact_ref("l9", "gold_readiness_axis", source_id, run_id),
            },
        },
    )


def _field_lineage(source_id: str, run_id: str, l5: dict[str, Any]) -> dict[str, Any]:
    return with_header(
        layer="l10",
        name="field_level_lineage",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l10.field_level_lineage.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L16",
            "artifact_type": "field_level_lineage",
            "lineage": [
                {
                    "source_path": field["source_path"],
                    "silver_field": field["target_name"],
                    "actions": field["recommended_actions"],
                    "pii_handling": field["pii_handling"],
                }
                for field in l5["silver_decision"]["fields"]
            ],
        },
    )


def _semantic_catalog_vector_index_template(
    source_id: str,
    run_id: str,
    catalog: dict[str, Any],
    sql_context: dict[str, Any],
    m6_context_status: dict[str, str],
) -> dict[str, Any]:
    dataset_id = catalog["dataset_id"]
    table_names = sql_context["allowed_tables"]
    documents: list[dict[str, Any]] = [
        {
            "doc_id": f"{dataset_id}:{run_id}:dataset_card",
            "document_type": "dataset_card",
            "text_for_embedding": (
                f"Dataset {catalog['dataset_name']} has layer status {catalog['layers']} and query tables {table_names}. "
                f"It is produced from source {source_id} run {run_id} with quality {catalog['quality']}."
            ),
            "payload": {
                "dataset_id": dataset_id,
                "source_id": source_id,
                "run_id": run_id,
                "layer": "silver_or_gold",
                "table_names": table_names,
                "m6_silver_context_status": m6_context_status["silver_context_status"],
                "m6_gold_context_status": m6_context_status["gold_context_status"],
                "access_class": "query_context_safe",
            },
        },
        {
            "doc_id": f"{dataset_id}:{run_id}:product_health_template",
            "document_type": "semantic_template",
            "text_for_embedding": (
                "Product health Gold template includes gold_product_health, risk_score, negative_review_rate, "
                "conversion_rate, late_delivery_rate, review_count, average_rating, view_count, purchase_count, and delivery_count. "
                "It is a draft template unless L9 approval and L15 Gold readiness make it query-ready."
            ),
            "payload": {
                "dataset_id": dataset_id,
                "source_id": source_id,
                "run_id": run_id,
                "template_id": "gold_product_health",
                "metric_ids": ["risk_score", "negative_review_rate", "conversion_rate", "late_delivery_rate"],
                "artifact_ref": artifact_ref("l4", "product_health_gold_template_draft", source_id, run_id),
                "access_class": "catalog_internal",
            },
        },
    ]
    for column in sql_context["allowed_columns"]:
        documents.append(
            {
                "doc_id": f"{dataset_id}:{run_id}:field:{column['column']}",
                "document_type": "schema_field",
                "text_for_embedding": (
                    f"Column {column['column']} in table {column['table']} has type {column['data_type']} "
                    f"from source path {column['source_path']}. {column['semantic_description']}"
                ),
                "payload": {
                    "dataset_id": dataset_id,
                    "source_id": source_id,
                    "run_id": run_id,
                    "table_name": column["table"],
                    "field_name": column["column"],
                    "data_type": column["data_type"],
                    "pii_handling": column["pii_handling"],
                    "catalog_exposure": column["catalog_exposure"],
                    "query_context_exposure": column["query_context_exposure"],
                    "access_class": "query_context_safe",
                },
            }
        )
    for metric in sql_context["metrics"]:
        documents.append(
            {
                "doc_id": f"{dataset_id}:{run_id}:metric:{metric['name']}",
                "document_type": "metric_definition",
                "text_for_embedding": (
                    f"Metric {metric['name']} belongs to Gold model {metric['gold_model_id']} "
                    f"with operation {metric['operation']} over field {metric.get('field')} and grain {metric.get('grain', [])}."
                ),
                "payload": {
                    "dataset_id": dataset_id,
                    "source_id": source_id,
                    "run_id": run_id,
                    "metric_id": metric["metric_id"],
                    "metric_name": metric["name"],
                    "gold_model_id": metric["gold_model_id"],
                    "semantic_status": metric["semantic_status"],
                    "access_class": "query_context_safe",
                },
            }
        )
    return with_header(
        layer="l10",
        name="semantic_catalog_vector_index_template",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l10.semantic_catalog_vector_index_template.v2_1_2",
        access_class="catalog_internal",
        body={
            "layer": "L16",
            "artifact_type": "semantic_catalog_vector_index_template",
            "index_intent": "schema_metric_catalog_retrieval",
            "execution_owner": "M6_or_vector_extension",
            "m3_embedding_execution": False,
            "vector_db_target": "qdrant_or_pinecone_compatible",
            "documents": documents,
            "payload_filter_keys": [
                "dataset_id",
                "source_id",
                "run_id",
                "document_type",
                "table_name",
                "field_name",
                "metric_id",
                "template_id",
                "access_class",
                "query_context_exposure",
            ],
            "recommended_search_policy": {
                "first_filter": ["dataset_id", "access_class", "query_context_exposure"],
                "then_vector_search": True,
                "fallback_when_vector_unavailable": "use exact catalog/sql_context metadata matching",
                "blocked_use": "Do not use vector similarity as proof that a metric value is correct.",
            },
            "accuracy_boundary": {
                "improves": "dataset, schema field, and metric candidate retrieval for M6 natural-language routing",
                "does_not_improve": "numeric correctness of Gold output values without deterministic transform execution and validation",
                "must_validate_with": ["L9 approval_state", "L15 gate_summary", "M2 execution evidence", "M6 SQL guardrail"],
            },
        },
    )


def _catalog_sync_package(source_id: str, run_id: str, m6_context_status: dict[str, str], has_gold_metrics: bool) -> dict[str, Any]:
    return with_header(
        layer="l10",
        name="catalog_sync_contract_package",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l10.catalog_sync_contract.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L16",
            "artifact_type": "catalog_sync_contract_package",
            "artifact_reference_manifest_ref": artifact_ref("l10", "artifact_reference_manifest", source_id, run_id),
            "m6_context_status": m6_context_status,
            "version_set": {
                "artifact_version": "v2.1.1",
                "schema_version": "v2.1.1",
                "profile_version": "v2.1.1",
                "redaction_policy_version": "m3.redaction.v2_1_1",
                "recommendation_schema_version": "v2.1.1",
                "decision_version": "v2.1.1",
                "compiler_version": "m3.compiler.v2_1_1",
                "allowlist_version": "v2.1.1",
                "gate_version": "m3.gate.v2_1_1",
                "catalog_contract_version": "v2.1.1",
            },
            "refs": {
                "source_manifest_ref": artifact_ref("l0", "source_manifest", source_id, run_id),
                "object_stream_manifest_ref": artifact_ref("l0", "object_stream_manifest", source_id, run_id),
                "bronze_envelope_ref": artifact_ref("l1", "bronze_envelope_samples", source_id, run_id),
                "rescue_lane_ref": artifact_ref("l1", "rescue_lane", source_id, run_id),
                "profile_snapshot_ref": artifact_ref("l2", "profile_snapshot", source_id, run_id),
                "redaction_map_ref": artifact_ref("l3", "redaction_map", source_id, run_id),
                "unknown_data_recommendation_pack_ref": artifact_ref("l3", "unknown_data_recommendation_pack", source_id, run_id),
                "metadata_retrieval_index_plan_ref": artifact_ref("l3", "metadata_retrieval_index_plan", source_id, run_id),
                "gold_template_candidate_retrieval_ref": artifact_ref("l3", "gold_template_candidate_retrieval", source_id, run_id),
                "candidate_grounding_report_ref": artifact_ref("l3", "candidate_grounding_report", source_id, run_id),
                "gold_draft_ref": artifact_ref("l4", "gold_model_recommendation_draft", source_id, run_id),
                "product_health_gold_template_ref": artifact_ref("l4", "product_health_gold_template_draft", source_id, run_id),
                "risk_score_policy_recommendation_ref": artifact_ref("l4", "risk_score_policy_recommendation_draft", source_id, run_id),
                "vector_embedding_handoff_template_ref": artifact_ref("l4", "vector_embedding_handoff_template", source_id, run_id),
                "approval_state_ref": artifact_ref("l5", "approval_state", source_id, run_id),
                "silver_decision_ref": artifact_ref("l5", "silver_policy_decision", source_id, run_id),
                "gold_decision_ref": artifact_ref("l5", "gold_policy_decision", source_id, run_id),
                "silver_spec_ref": artifact_ref("l6", "silver_transform_spec", source_id, run_id),
                "gold_spec_ref": artifact_ref("l6", "gold_generation_spec", source_id, run_id),
                "compiler_validation_ref": artifact_ref("l6", "compiler_validation_result", source_id, run_id),
                "silver_preview_ref": artifact_ref("l7", "silver_preview", source_id, run_id),
                "gold_preview_ref": artifact_ref("l8", "gold_preview", source_id, run_id),
                "metric_definition_ref": artifact_ref("l8", "metric_definition_draft", source_id, run_id),
                "gate_summary_ref": artifact_ref("l9", "gate_summary", source_id, run_id),
                "catalog_metadata_ref": artifact_ref("l10", "catalog_metadata_draft", source_id, run_id),
                "sql_context_ref": artifact_ref("l10", "sql_context_pack", source_id, run_id),
                "semantic_catalog_vector_index_template_ref": artifact_ref("l10", "semantic_catalog_vector_index_template", source_id, run_id),
                "quality_axis_refs": {
                    "processing_quality_axis_ref": artifact_ref("l9", "processing_quality_axis", source_id, run_id),
                    "catalog_safety_axis_ref": artifact_ref("l9", "catalog_safety_axis", source_id, run_id),
                    "gold_readiness_axis_ref": artifact_ref("l9", "gold_readiness_axis", source_id, run_id),
                },
            },
        },
    )


def _artifact_reference_manifest(out_dir: Path, source_id: str, run_id: str) -> dict[str, Any]:
    artifacts = []
    for path in sorted(out_dir.rglob("*")):
        if not path.is_file():
            continue
        try:
            payload = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            payload = ""
        artifact_id = None
        access_class = "catalog_internal"
        producer = "M3"
        artifact_name = path.stem
        logical_layer = None
        physical_layer = None
        if payload:
            try:
                data = json.loads(payload)
                header = data.get("artifact_header", {})
                artifact_id = header.get("artifact_id")
                artifact_name = header.get("artifact_name", artifact_name)
                access_class = header.get("access_class", access_class)
                producer = header.get("producer", producer)
                logical_layer = header.get("logical_layer")
                physical_layer = header.get("physical_layer")
            except Exception:
                pass
        if artifact_id is None:
            continue
        artifacts.append(
            {
                "artifact_id": artifact_id,
                "artifact_name": artifact_name,
                "artifact_version": "v2.1.1",
                "logical_layer": logical_layer,
                "physical_layer": physical_layer,
                "logical_path": str(path.relative_to(out_dir)).replace("\\", "/"),
                "physical_uri": path.resolve().as_uri(),
                "content_type": "application/json" if path.suffix == ".json" else "application/jsonl" if path.suffix == ".jsonl" else "text/plain",
                "checksum": f"sha256:{file_sha256(path)}",
                "byte_size": path.stat().st_size,
                "producer": producer,
                "access_class": access_class,
            }
        )
    return with_header(
        layer="l10",
        name="artifact_reference_manifest",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.common.artifact_reference_manifest.v2_1_1",
        access_class="catalog_internal",
        body={"layer": "L16", "artifact_type": "artifact_reference_manifest", "artifacts": artifacts},
    )


def export_transform_spec(source_id: str, run_id: str, l5: dict[str, Any], l6: dict[str, Any], metrics: list[dict[str, Any]]) -> dict[str, Any]:
    selected_columns = [field["target_name"] for field in l5["silver_decision"]["fields"] if "drop" not in field["recommended_actions"]]
    operations: list[dict[str, Any]] = [
        {"id": "select_silver", "type": "select", "input": "artifact_bronze", "output": "artifact_silver_selected", "columns": selected_columns},
        {"id": "normalize_silver", "type": "normalize", "input": "artifact_silver_selected", "output": "artifact_silver", "casts": _casts(l5)},
    ]
    if metrics:
        operations.append(
            {
                "id": "aggregate_gold",
                "type": "aggregate",
                "input": "artifact_silver",
                "output": "artifact_gold",
                "group_by": sorted({grain for metric in metrics for grain in metric.get("grain", [])}),
                "metrics": [{"name": metric["name"], "operation": metric["operation"], "field": metric.get("field")} for metric in metrics],
            }
        )
        target_dataset = f"dataset_{source_id}_gold"
        layer = "gold"
        query_table = f"{source_id}_gold"
        output_columns = sorted({grain for metric in metrics for grain in metric.get("grain", [])}) + [metric["name"] for metric in metrics]
    else:
        target_dataset = f"dataset_{source_id}_silver"
        layer = "silver"
        query_table = f"{source_id}_silver"
        output_columns = selected_columns
    operations.append({"id": "load_output", "type": "load", "input": operations[-1]["output"], "target_dataset": target_dataset, "layer": layer, "query_table": query_table})
    return {
        "contract": "TransformSpec",
        "logical_layer": "L16",
        "logical_layer_version": LOGICAL_LAYER_VERSION,
        "producer": "M3",
        "consumers": ["M5"],
        "tenant_id": "tenant_demo",
        "source_id": source_id,
        "pipeline_id": f"pipeline_{source_id}_{run_id}",
        "schema_version": f"schema_{source_id}_v2_1_1",
        "version": f"transform_{source_id}_{run_id}",
        "target_dataset": target_dataset,
        "operations": operations,
        "quality_rules": [
            {"id": "schema_match", "type": "schema_match", "severity": "blocking"},
            {"id": "row_count_nonzero", "type": "row_count_min", "min": 1, "severity": "blocking"},
        ],
        "catalog_facts": {"layer": layer, "query_table": query_table, "source_lineage": [source_id], "output_columns": output_columns},
        "ownership_constraints": {
            "m3_does_not_create_spark_session": True,
            "m3_does_not_write_catalog": True,
            "m5_owns_runner_selection": True,
        },
        "m3_contract_refs": {
            "silver_spec_ref": artifact_ref("l6", "silver_transform_spec", source_id, run_id),
            "gold_spec_ref": artifact_ref("l6", "gold_generation_spec", source_id, run_id),
            "compiler_validation_ref": artifact_ref("l6", "compiler_validation_result", source_id, run_id),
        },
    }


def export_schema_definition(source_id: str, run_id: str, l5: dict[str, Any]) -> dict[str, Any]:
    fields = [
        {
            "path": field["target_name"],
            "type": field["target_type"],
            "nullable": field["nullable_ratio"] > 0,
            "array": field["target_type"] == "json",
            "override": "cast" in field["recommended_actions"] or "parse_timestamp" in field["recommended_actions"],
            "missing_ratio": field["nullable_ratio"],
            "nested_kind": "json" if field["target_type"] == "json" else "scalar",
        }
        for field in l5["silver_decision"]["fields"]
        if "drop" not in field["recommended_actions"]
    ]
    return {
        "contract": "SchemaDefinition",
        "logical_layer": "L16",
        "logical_layer_version": LOGICAL_LAYER_VERSION,
        "producer": "M3",
        "consumers": ["M1", "M5", "M6"],
        "tenant_id": "tenant_demo",
        "source_id": source_id,
        "dataset_id": f"dataset_{source_id}_silver",
        "schema_version": f"schema_{source_id}_v2_1_1",
        "fields": fields,
        "transform_hints": _casts(l5),
        "sample_size": None,
        "sample_size_decision": "bounded L1 sample; production row count is M2 execution evidence",
        "m3_contract_refs": {"approval_state_ref": artifact_ref("l5", "approval_state", source_id, run_id)},
    }


def export_workflow_definition(source_id: str, run_id: str, l5: dict[str, Any], has_gold: bool) -> dict[str, Any]:
    target_dataset = f"dataset_{source_id}_{'gold' if has_gold else 'silver'}"
    nodes = [
        {"id": "node_source", "type": "Source", "source_id": source_id, "outputs": ["artifact_bronze"]},
        {
            "id": "node_select",
            "type": "Select/Filter",
            "config": {"columns": [field["target_name"] for field in l5["silver_decision"]["fields"] if "drop" not in field["recommended_actions"]]},
            "inputs": ["artifact_bronze"],
            "outputs": ["artifact_silver_selected"],
        },
        {"id": "node_normalize", "type": "Cast/Normalize", "schema_version": f"schema_{source_id}_v2_1_1", "inputs": ["artifact_silver_selected"], "outputs": ["artifact_silver"]},
    ]
    edges = [["node_source", "node_select"], ["node_select", "node_normalize"]]
    if has_gold:
        nodes.append({"id": "node_aggregate", "type": "Aggregate", "config": {"group_by": [], "metrics": [{"name": "row_count", "operation": "count"}]}, "inputs": ["artifact_silver"], "outputs": ["artifact_gold"]})
        edges.append(["node_normalize", "node_aggregate"])
        load_input = "artifact_gold"
        prev_node = "node_aggregate"
    else:
        load_input = "artifact_silver"
        prev_node = "node_normalize"
    nodes.append({"id": "node_load", "type": "Load", "target_dataset": target_dataset, "inputs": [load_input], "outputs": [target_dataset]})
    edges.append([prev_node, "node_load"])
    return {
        "contract": "WorkflowDefinition",
        "logical_layer": "L16",
        "logical_layer_version": LOGICAL_LAYER_VERSION,
        "producer": "M3",
        "consumers": ["M5"],
        "tenant_id": "tenant_demo",
        "pipeline_id": f"pipeline_{source_id}_{run_id}",
        "name": f"{source_id} M3 generated preview workflow",
        "nodes": nodes,
        "edges": edges,
        "target_dataset": target_dataset,
        "schedule": None,
        "runner": {"primary": "local_runner_or_spark_runner_by_M5", "m3_runtime_ownership": "none"},
    }


def export_catalog_metadata(source_id: str, run_id: str, catalog: dict[str, Any], sql_context: dict[str, Any]) -> dict[str, Any]:
    allowed_columns = sql_context["allowed_columns"]
    return {
        "contract": "CatalogMetadata",
        "logical_layer": "L16",
        "logical_layer_version": LOGICAL_LAYER_VERSION,
        "producers": ["M3", "M5"],
        "consumers": ["M1", "M6"],
        "tenant_id": "tenant_demo",
        "dataset_id": catalog["dataset_id"],
        "version": "v2.1.1",
        "name": catalog["dataset_name"],
        "layer": "silver" if catalog["layers"][2]["status"] in {"not_requested", "deferred", "blocked"} else "gold",
        "data_shape_contract": catalog.get("data_shape_contract", {}),
        "s3_uri": None,
        "s3_uri_status": "m2_execution_pending",
        "storage": {"profile": "local_or_minio_by_M2", "bucket": None, "prefix": None, "local_fallback_path": None},
        "schema": {"schema_version": f"schema_{source_id}_v2_1_1", "fields": [{"name": col["column"], "type": col["data_type"], "nullable": True} for col in allowed_columns]},
        "metrics": {"semantics": {"row_count": "output_dataset_rows", "bytes": "output_dataset_bytes"}, "row_count": None, "bytes": None, "quality": catalog["quality"]},
        "lineage": {"source_ids": [source_id], "pipeline_id": f"pipeline_{source_id}_{run_id}", "run_id": run_id, "upstream_datasets": []},
        "query": {
            "table_name": sql_context["allowed_tables"][0] if sql_context["allowed_tables"] else None,
            "allow_readonly_sql": sql_context["m6_context_status"]["silver_context_status"] in {"ready", "ready_with_caveat"},
            "allowed_columns": [col["column"] for col in allowed_columns],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "freshness": sql_context["freshness"],
        "m3_contract_refs": {
            "catalog_sync_contract_package_ref": artifact_ref("l10", "catalog_sync_contract_package", source_id, run_id),
            "sql_context_ref": artifact_ref("l10", "sql_context_pack", source_id, run_id),
            "semantic_catalog_vector_index_template_ref": artifact_ref("l10", "semantic_catalog_vector_index_template", source_id, run_id),
            "product_health_gold_template_ref": artifact_ref("l4", "product_health_gold_template_draft", source_id, run_id),
            "risk_score_policy_recommendation_ref": artifact_ref("l4", "risk_score_policy_recommendation_draft", source_id, run_id),
            "vector_embedding_handoff_template_ref": artifact_ref("l4", "vector_embedding_handoff_template", source_id, run_id),
        },
    }


def _casts(l5: dict[str, Any]) -> list[dict[str, str]]:
    return [
        {"operation": "cast", "field": field["target_name"], "target_type": field["target_type"]}
        for field in l5["silver_decision"]["fields"]
        if "cast" in field["recommended_actions"] or "parse_timestamp" in field["recommended_actions"]
    ]


def _gold_layer_status(l5_status: str, gold_context_status: str) -> str:
    if l5_status == "not_requested":
        return "not_requested"
    if l5_status == "deferred":
        return "deferred"
    if l5_status == "needs_owner_review":
        return "needs_owner_review"
    if gold_context_status in {"ready", "ready_with_caveat"}:
        return "available"
    return "blocked"
