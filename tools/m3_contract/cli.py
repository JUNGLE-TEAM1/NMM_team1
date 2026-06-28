from __future__ import annotations

import argparse
from pathlib import Path

from .common import write_json
from .l0_raw import build_l0
from .l1_bronze import build_l1
from .l2_profile import build_l2
from .l3_recommend import build_l3
from .l4_recommendation import build_l4
from .l5_decision import build_l5
from .l6_compiler import build_l6
from .l7_silver_preview import build_l7
from .l8_gold_preview import build_l8
from .l9_gate import build_l9
from .l10_handoff import build_l10


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create M3 L0-L10 contracts for unknown CSV/JSON/JSONL sources.")
    parser.add_argument("--source", required=True, help="Input file or directory. M3 records references and bounded samples only.")
    parser.add_argument("--source-id", required=True, help="Stable source identifier used in generated contracts.")
    parser.add_argument("--output", required=True, help="Output directory for L0-L10 contract artifacts.")
    parser.add_argument("--run-id", default="m3_contract_run_001")
    parser.add_argument("--format", choices=["auto", "csv", "json", "jsonl", "text"], default="auto")
    parser.add_argument("--sample-rows", type=int, default=5000)
    parser.add_argument("--sample-bytes", type=int, default=64 * 1024 * 1024)
    parser.add_argument("--checksum-mode", choices=["none", "prefix", "full"], default="prefix")
    parser.add_argument("--checksum-bytes", type=int, default=8 * 1024 * 1024)
    parser.add_argument("--ai-model-slot", default="deterministic")
    parser.add_argument(
        "--gold-decision",
        choices=["not_requested", "deferred", "needs_owner_review", "approved", "rejected"],
        default="deferred",
        help="L5 user decision for Gold. Default keeps Gold recommendation visible but not executable.",
    )
    return parser.parse_args()


def run(args: argparse.Namespace) -> dict[str, object]:
    source = Path(args.source)
    out_dir = Path(args.output)
    l0 = build_l0(source, out_dir, args.source_id, args.run_id, args.checksum_mode, args.checksum_bytes)
    l1 = build_l1(l0, out_dir, args.source_id, args.run_id, args.sample_rows, args.sample_bytes)
    l2 = build_l2(l1["samples"], l0["files"], l0, out_dir, args.source_id, args.run_id, args.format)
    l3 = build_l3(l2["profile"], out_dir, args.source_id, args.run_id)
    l4 = build_l4(l3, out_dir, args.source_id, args.run_id, args.ai_model_slot)
    l5 = build_l5(l4, out_dir, args.source_id, args.run_id, args.gold_decision)
    l6 = build_l6(l0, l5, out_dir, args.source_id, args.run_id)
    l7 = build_l7(l5, l6, out_dir, args.source_id, args.run_id)
    l8 = build_l8(l5, l6, out_dir, args.source_id, args.run_id)
    l9 = build_l9(l7, l8, out_dir, args.source_id, args.run_id)
    l10 = build_l10(out_dir, args.source_id, args.run_id, l2["profile"], l5, l6, l8, l9)
    summary = {
        "source_id": args.source_id,
        "run_id": args.run_id,
        "output": str(out_dir),
        "layers": {
            "L0": "l0/object_stream_manifest.json",
            "L1": ["l1/bronze_envelope_samples.manifest.json", "l1/rescue_lane.manifest.json"],
            "L2": "l2/profile_snapshot.json",
            "L3": "l3/ai_recommendation_input_pack.json",
            "L4": ["l4/silver_policy_recommendation_draft.json", "l4/gold_model_recommendation_draft.json"],
            "L5": ["l5/silver_policy_decision.json", "l5/gold_policy_decision.json", "l5/approval_state.json"],
            "L6": ["l6/silver_transform_spec.json", "l6/gold_generation_spec.json", "l6/compiler_validation_result.json"],
            "L7": "l7/silver_preview_validation_result.json",
            "L8": "l8/gold_readiness_input_report.json",
            "L9": "l9/gate_summary.json",
            "L10": ["l10/catalog_sync_contract_package.json", "l10/catalog_metadata_draft.json", "l10/sql_context_pack.json"],
            "exports": ["exports/transform_spec.json", "exports/schema_definition.json", "exports/workflow_definition.json", "exports/catalog_metadata.json"],
        },
        "m3_scope": "L0-L10 contract planning, AI-safe recommendation, preview-only spec, and catalog/query handoff only; no distributed runtime ownership, no production write, no raw copy",
        "handoff": {
            "M1": "source registration and L5 decision UI",
            "M2": "execute L6 preview-only specs and return L7/L8 preview metrics",
            "M5": "store L10 catalog sync package and run/catalog state",
            "M6": "use L10 SQL/query context with L9 caveats",
        },
        "m6_context_status": l9["gate_summary"]["m6_context_status"],
        "catalog_status": l10["catalog"]["quality"],
    }
    write_json(out_dir / "run_summary.json", summary)
    return summary


def main() -> int:
    summary = run(parse_args())
    print(f"M3 contract artifacts written to {summary['output']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
