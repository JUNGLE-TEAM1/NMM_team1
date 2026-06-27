from __future__ import annotations

import argparse
from pathlib import Path

from .common import write_json
from .l0_raw import build_l0
from .l1_bronze import build_l1
from .l2_profile import build_l2
from .l3_recommend import build_l3
from .l4_spec import build_l4
from .l5_quality import build_l5
from .l6_catalog import build_l6


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create M3 L0-L6 contracts for unknown CSV/JSON/JSONL sources.")
    parser.add_argument("--source", required=True, help="Input file or directory. M3 records references and bounded samples only.")
    parser.add_argument("--source-id", required=True, help="Stable source identifier used in generated contracts.")
    parser.add_argument("--output", required=True, help="Output directory for L0-L6 contract artifacts.")
    parser.add_argument("--format", choices=["auto", "csv", "json", "jsonl", "text"], default="auto")
    parser.add_argument("--sample-rows", type=int, default=5000)
    parser.add_argument("--sample-bytes", type=int, default=64 * 1024 * 1024)
    parser.add_argument("--checksum-mode", choices=["none", "prefix", "full"], default="prefix")
    parser.add_argument("--checksum-bytes", type=int, default=8 * 1024 * 1024)
    return parser.parse_args()


def run(args: argparse.Namespace) -> dict[str, object]:
    source = Path(args.source)
    out_dir = Path(args.output)
    l0 = build_l0(source, out_dir, args.source_id, args.checksum_mode, args.checksum_bytes)
    l1 = build_l1(l0["files"], out_dir, args.source_id, args.sample_rows, args.sample_bytes)
    l2 = build_l2(l1["samples"], l0["files"], out_dir, args.source_id, args.format)
    l3 = build_l3(l2["profile"], out_dir, args.source_id)
    l4 = build_l4(l2["profile"], l3, out_dir, args.source_id)
    l5 = build_l5(l2["profile"], l4, out_dir, args.source_id)
    l6 = build_l6(l2["profile"], l3, l4, l5, out_dir, args.source_id)
    summary = {
        "source_id": args.source_id,
        "output": str(out_dir),
        "layers": {
            "L0": "l0/raw_manifest.json",
            "L1": "l1/bronze_envelope_spec.json",
            "L2": "l2/profile_snapshot.json",
            "L3": ["l3/silver_policy_recommendation.json", "l3/gold_policy_recommendation.json"],
            "L4": ["l4/silver_transform_spec.json", "l4/gold_generation_spec.json"],
            "L5": "l5/quality_gate_spec.json",
            "L6": "l6/catalog_metadata_draft.json",
        },
        "m3_scope": "contract planning only; no distributed execution config, no object-storage config, no raw copy",
        "handoff": {"M2": "execute L4 specs", "M5": "store workflow/catalog artifacts", "M6": "use L6 semantic context"},
        "catalog_status": l6["catalog"]["quality"],
    }
    write_json(out_dir / "run_summary.json", summary)
    return summary


def main() -> int:
    summary = run(parse_args())
    print(f"M3 contract artifacts written to {summary['output']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
