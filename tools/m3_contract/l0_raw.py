from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, file_fingerprint, iter_source_files, stable_json_hash, with_header, write_json


def build_l0(
    source: Path,
    out_dir: Path,
    source_id: str,
    run_id: str,
    checksum_mode: str = "prefix",
    checksum_bytes: int = 8 * 1024 * 1024,
) -> dict[str, Any]:
    """Create L0 source-unit manifest without copying or mutating raw data."""

    layer_dir = out_dir / "l0"
    ensure_dir(layer_dir)
    files = iter_source_files(source)
    objects: list[dict[str, Any]] = []
    source_units: list[dict[str, Any]] = []

    for index, path in enumerate(files, start=1):
        object_id = f"{source_id}_object_{index:05d}"
        source_unit_id = f"{source_id}_unit_{index:05d}"
        fingerprint = file_fingerprint(path, checksum_mode, checksum_bytes)
        objects.append(
            {
                "object_id": object_id,
                "source_unit_id": source_unit_id,
                "uri": fingerprint["uri"],
                "path": fingerprint["path"],
                "etag": None,
                "checksum": f"sha256:{fingerprint['checksum']}" if fingerprint.get("checksum") else None,
                "checksum_mode": fingerprint["checksum_mode"],
                "checksum_bytes": fingerprint.get("checksum_bytes"),
                "byte_size": fingerprint["size_bytes"],
                "compression": "gzip" if path.name.lower().endswith(".gz") else "none",
                "partition_values": {},
                "modified_at": fingerprint["modified_time_utc"],
            }
        )
        source_units.append(
            {
                "source_unit_id": source_unit_id,
                "source_unit_type": "object_batch",
                "object_ids": [object_id],
                "stream_window_ids": [],
                "ingest_time_range": {"start": None, "end": None},
            }
        )

    body = {
        "layer": "L0",
        "artifact_type": "object_stream_manifest",
        "source_id": source_id,
        "run_id": run_id,
        "source_root": str(source),
        "source_kind": "object",
        "declared_format": "unknown",
        "source_units": source_units,
        "object_count": len(objects),
        "total_size_bytes": sum(item["byte_size"] for item in objects),
        "objects": objects,
        "stream_windows": [],
        "raw_policy": {
            "copy_raw_payload": False,
            "mutate_raw_payload": False,
            "default_checksum_mode": checksum_mode,
            "note": "M3 records replayable source units and bounded checksums; raw storage ownership stays outside M3.",
        },
    }
    body["manifest_hash"] = stable_json_hash(body)
    manifest = with_header(
        layer="l0",
        name="object_stream_manifest",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l0.object_stream_manifest.v2_1_1",
        access_class="catalog_internal",
        body=body,
    )
    source_manifest = with_header(
        layer="l0",
        name="source_manifest",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l0.source_manifest.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L0",
            "artifact_type": "source_manifest",
            "source_id": source_id,
            "run_id": run_id,
            "source_root": str(source),
            "source_kind": "object",
            "source_unit_ids": [unit["source_unit_id"] for unit in source_units],
            "object_stream_manifest_ref": artifact_ref("l0", "object_stream_manifest", source_id, run_id),
        },
    )
    replay = with_header(
        layer="l0",
        name="raw_replay_pointer",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l0.raw_replay_pointer.v2_1_1",
        access_class="raw_restricted",
        body={
            "layer": "L0",
            "artifact_type": "raw_replay_pointer",
            "source_id": source_id,
            "run_id": run_id,
            "object_stream_manifest_ref": artifact_ref("l0", "object_stream_manifest", source_id, run_id),
            "object_uris": [item["uri"] for item in objects],
            "source_unit_ids": [unit["source_unit_id"] for unit in source_units],
            "replay_contract": "Use source_unit_id plus object_id and locator fields when M2 materializes Bronze/Silver.",
        },
    )

    write_json(layer_dir / "object_stream_manifest.json", manifest)
    write_json(layer_dir / "source_manifest.json", source_manifest)
    write_json(layer_dir / "raw_replay_pointer.json", replay)
    write_json(layer_dir / "raw_manifest.json", manifest)
    return {
        "files": files,
        "manifest": manifest,
        "source_manifest": source_manifest,
        "replay": replay,
        "objects": objects,
        "source_units": source_units,
    }
