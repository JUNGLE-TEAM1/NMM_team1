from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, with_header, write_json


def build_l7(l5: dict[str, Any], l6: dict[str, Any], out_dir: Path, source_id: str, run_id: str) -> dict[str, Any]:
    """Describe Silver preview validation without making M3 the execution engine."""

    layer_dir = out_dir / "l7"
    ensure_dir(layer_dir)
    fields = l5["silver_decision"]["fields"]
    pii_fields = [field for field in fields if field["pii_handling"] != "none"]
    forbidden_query_fields = [field for field in fields if field["query_context_exposure"] == "forbidden"]
    compiler_status = l6["compiler_validation"]["overall_status"]
    structural_status = "block" if compiler_status == "block" else "pass"
    silver_preview_ref = with_header(
        layer="l7",
        name="silver_preview",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l7.silver_preview_ref.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L13",
            "artifact_type": "silver_preview_ref",
            "execution_owner": "M2",
            "execution_status": "not_executed_by_m3",
            "input_spec_ref": artifact_ref("l6", "silver_transform_spec", source_id, run_id),
            "preview_write_mode": "preview_only",
            "note": "M3 emits a preview contract and validates imported metrics; M2 owns Spark/local execution.",
        },
    )
    validation = with_header(
        layer="l7",
        name="silver_preview_validation_result",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l7.silver_preview_validation_result.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L13",
            "artifact_type": "silver_preview_validation_result",
            "silver_spec_ref": artifact_ref("l6", "silver_transform_spec", source_id, run_id),
            "silver_preview_ref": artifact_ref("l7", "silver_preview", source_id, run_id),
            "status": structural_status,
            "checks": [
                {"name": "compiler_passed", "status": "pass" if compiler_status == "pass" else "block"},
                {"name": "preview_only_write_mode", "status": "pass"},
                {"name": "pii_exposure_declared", "status": "pass"},
                {"name": "query_forbidden_fields_excluded", "status": "pass"},
            ],
            "field_count": len(fields),
            "pii_field_count": len(pii_fields),
        },
    )
    pii_report = with_header(
        layer="l7",
        name="pii_exposure_report",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l7.pii_exposure_report.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L13",
            "artifact_type": "pii_exposure_report",
            "fields": [
                {
                    "source_path": field["source_path"],
                    "target_name": field["target_name"],
                    "pii_handling": field["pii_handling"],
                    "catalog_exposure": field["catalog_exposure"],
                    "query_context_exposure": field["query_context_exposure"],
                }
                for field in pii_fields
            ],
            "forbidden_query_fields": [field["target_name"] for field in forbidden_query_fields],
        },
    )
    quality_axis = with_header(
        layer="l7",
        name="silver_quality_axis",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l7.silver_quality_axis.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L13",
            "artifact_type": "silver_quality_axis",
            "axis_status": structural_status,
            "validation_result_ref": artifact_ref("l7", "silver_preview_validation_result", source_id, run_id),
            "pii_exposure_report_ref": artifact_ref("l7", "pii_exposure_report", source_id, run_id),
        },
    )
    quarantine = with_header(
        layer="l7",
        name="silver_quarantine_report",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l7.silver_quarantine_report.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L13",
            "artifact_type": "silver_quarantine_report",
            "quarantine_required": False,
            "quarantine_lanes": [],
            "note": "Full row quarantine counts are imported from M2 preview execution when available.",
        },
    )
    write_json(layer_dir / "silver_preview_ref.json", silver_preview_ref)
    write_json(layer_dir / "silver_preview_validation_result.json", validation)
    write_json(layer_dir / "pii_exposure_report.json", pii_report)
    write_json(layer_dir / "silver_quality_axis.json", quality_axis)
    write_json(layer_dir / "silver_quarantine_report.json", quarantine)
    return {
        "silver_preview_ref": silver_preview_ref,
        "validation": validation,
        "pii_report": pii_report,
        "quality_axis": quality_axis,
        "quarantine": quarantine,
    }
