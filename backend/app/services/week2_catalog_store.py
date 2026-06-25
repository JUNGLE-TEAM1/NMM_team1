import json
import re
from pathlib import Path
from typing import Any


RUN_SEQUENCE_RE = re.compile(r"run_reviews_demo_(\d+)$")


class Week2CatalogStore:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.runs_dir = root / "runs"
        self.catalog_dir = root / "catalog"

    def load_runs(self) -> dict[str, dict[str, Any]]:
        return load_json_objects(self.runs_dir, "run_id")

    def load_catalog(self) -> dict[str, dict[str, Any]]:
        return load_json_objects(self.catalog_dir, "dataset_id")

    def save_run(self, run: dict[str, Any]) -> None:
        write_json(self.runs_dir / f"{run['run_id']}.json", run)

    def save_catalog(self, catalog: dict[str, Any]) -> None:
        write_json(self.catalog_dir / f"{catalog['dataset_id']}.json", catalog)

    def sequence_start(self, runs: dict[str, dict[str, Any]]) -> int:
        latest = 0
        for run_id in runs:
            match = RUN_SEQUENCE_RE.match(run_id)
            if match is not None:
                latest = max(latest, int(match.group(1)))
        return latest


def load_json_objects(directory: Path, key: str) -> dict[str, dict[str, Any]]:
    if not directory.exists():
        return {}

    objects = {}
    for path in sorted(directory.glob("*.json")):
        with path.open(encoding="utf-8") as file:
            value = json.load(file)
        objects[value[key]] = value
    return objects


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(value, file, ensure_ascii=False, indent=2, sort_keys=True)
        file.write("\n")
