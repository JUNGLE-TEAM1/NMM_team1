from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import ensure_dir, file_fingerprint, iter_source_files, stable_json_hash, utc_now, write_json


def build_l0(
    source: Path,
    out_dir: Path,
    source_id: str,
    checksum_mode: str = "prefix",
    checksum_bytes: int = 8 * 1024 * 1024,
) -> dict[str, Any]:
    """Create raw preservation metadata without copying or mutating raw data."""
    layer_dir = out_dir / "l0"
    ensure_dir(layer_dir)
    files = iter_source_files(source)
    objects = [file_fingerprint(path, checksum_mode, checksum_bytes) for path in files]
    manifest = {
        "layer": "L0",
        "artifact_type": "raw_preservation_manifest",
        "source_id": source_id,
        "created_at": utc_now(),
        "source_root": str(source),
        "object_count": len(objects),
        "total_size_bytes": sum(item["size_bytes"] for item in objects),
        "objects": objects,
        "raw_policy": {
            "copy_raw_payload": False,
            "mutate_raw_payload": False,
            "default_checksum_mode": checksum_mode,
            "note": "M3 records replayable references and bounded checksums; raw storage ownership stays outside M3.",
        },
    }
    manifest["manifest_hash"] = stable_json_hash(manifest)
    replay = {
        "layer": "L0",
        "source_id": source_id,
        "manifest_ref": "raw_manifest.json",
        "object_uris": [item["uri"] for item in objects],
        "replay_contract": "Use the exact object URIs and manifest_hash when M2 materializes Bronze/Silver.",
    }
    write_json(layer_dir / "raw_manifest.json", manifest)
    write_json(layer_dir / "replay_manifest.json", replay)
    return {"files": files, "manifest": manifest, "replay": replay}
