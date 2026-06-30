from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, with_header, write_json


VALID_GOLD_DECISIONS = {"not_requested", "deferred", "needs_owner_review", "approved", "rejected"}


def build_l5(
    l4: dict[str, Any],
    out_dir: Path,
    source_id: str,
    run_id: str,
    gold_decision: str,
) -> dict[str, Any]:
    """Lock editable recommendation drafts into user decision contracts."""

    if gold_decision not in VALID_GOLD_DECISIONS:
        raise ValueError(f"Unsupported gold decision: {gold_decision}")
    layer_dir = out_dir / "l5"
    ensure_dir(layer_dir)
    silver_decision = with_header(
        layer="l5",
        name="silver_policy_decision",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l5.silver_policy_decision.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L9",
            "artifact_type": "silver_policy_decision",
            "silver_draft_ref": artifact_ref("l4", "silver_policy_recommendation_draft", source_id, run_id),
            "decision_status": "approved",
            "decision_source": "default_user_acceptance_for_preview",
            "fields": l4["silver_draft"]["fields"],
            "decision_trace_id": f"decision_trace_{source_id}_{run_id}_silver",
            "review_id": f"review_{source_id}_{run_id}_silver",
        },
    )
    gold_models = l4["gold_draft"]["gold_models"] if gold_decision == "approved" else []
    gold_decision_artifact = with_header(
        layer="l5",
        name="gold_policy_decision",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l5.gold_policy_decision.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L9",
            "artifact_type": "gold_policy_decision",
            "gold_draft_ref": artifact_ref("l4", "gold_model_recommendation_draft", source_id, run_id),
            "decision_status": gold_decision,
            "gold_requested": gold_decision not in {"not_requested"},
            "selected_gold_models": gold_models,
            "reason": _gold_decision_reason(gold_decision),
            "decision_trace_id": f"decision_trace_{source_id}_{run_id}_gold",
            "review_id": f"review_{source_id}_{run_id}_gold",
        },
    )
    gold_to_gold_decision = with_header(
        layer="l5",
        name="gold_to_gold_policy_decision",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l5.gold_to_gold_policy_decision.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L9",
            "artifact_type": "gold_to_gold_policy_decision",
            "decision_status": "not_requested",
            "user_selectable": True,
            "selected_models": [],
            "reason": "Gold-to-Gold derivation is optional and must be requested by a user.",
        },
    )
    approval = with_header(
        layer="l5",
        name="approval_state",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l5.approval_state.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L9",
            "artifact_type": "approval_state",
            "silver": {
                "decision_ref": artifact_ref("l5", "silver_policy_decision", source_id, run_id),
                "decision_status": "approved",
                "compile_allowed": True,
            },
            "gold": {
                "decision_ref": artifact_ref("l5", "gold_policy_decision", source_id, run_id),
                "decision_status": gold_decision,
                "compile_allowed": gold_decision == "approved",
            },
            "gold_to_gold": {
                "decision_ref": artifact_ref("l5", "gold_to_gold_policy_decision", source_id, run_id),
                "decision_status": "not_requested",
                "compile_allowed": False,
            },
            "product_health_gold_template": {
                "template_ref": artifact_ref("l4", "product_health_gold_template_draft", source_id, run_id),
                "decision_status": "deferred",
                "compile_allowed": False,
                "reason": "Presentation product health template is visible for review but cannot compile until explicitly approved by the user.",
            },
            "risk_score_policy": {
                "policy_ref": artifact_ref("l4", "risk_score_policy_recommendation_draft", source_id, run_id),
                "decision_status": "deferred",
                "compile_allowed": False,
                "reason": "Risk score formula and weights are AI/model recommendations and must be approved or edited before deterministic Gold execution.",
            },
            "vector_embedding_handoff": {
                "template_ref": artifact_ref("l4", "vector_embedding_handoff_template", source_id, run_id),
                "decision_status": "deferred",
                "handoff_allowed": False,
                "compile_allowed": False,
                "reason": "Embedding/vector index creation is an extension handoff and requires separate M5/M6 approval.",
            },
        },
    )
    diff = with_header(
        layer="l5",
        name="recommendation_diff",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l5.recommendation_diff.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L9",
            "artifact_type": "recommendation_diff",
            "silver_changes_from_draft": [],
            "gold_changes_from_draft": [] if gold_decision == "approved" else ["gold draft retained but not approved for compile"],
        },
    )
    write_json(layer_dir / "silver_policy_decision.json", silver_decision)
    write_json(layer_dir / "gold_policy_decision.json", gold_decision_artifact)
    write_json(layer_dir / "gold_to_gold_policy_decision.json", gold_to_gold_decision)
    write_json(layer_dir / "approval_state.json", approval)
    write_json(layer_dir / "recommendation_diff.json", diff)
    return {
        "silver_decision": silver_decision,
        "gold_decision": gold_decision_artifact,
        "gold_to_gold_decision": gold_to_gold_decision,
        "approval_state": approval,
        "recommendation_diff": diff,
    }


def _gold_decision_reason(decision: str) -> str:
    if decision == "approved":
        return "User approved Gold recommendation for preview compile."
    if decision == "not_requested":
        return "User did not request a Gold layer for this source."
    if decision == "deferred":
        return "Gold recommendation exists but owner review or product decision is deferred."
    if decision == "needs_owner_review":
        return "Gold grain or metric semantics require domain owner review."
    return "User rejected the Gold recommendation."
