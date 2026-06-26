import json
from pathlib import Path
from typing import Any


class FixtureCatalogSource:
    def __init__(self, catalog_path: Path | None = None) -> None:
        self.catalog_path = catalog_path or self._default_catalog_path()

    def list_catalogs(self, tenant_id: str | None = None) -> list[dict[str, Any]]:
        catalog = json.loads(self.catalog_path.read_text(encoding="utf-8"))
        if tenant_id is not None and catalog.get("tenant_id") != tenant_id:
            return []
        return [catalog]

    def _default_catalog_path(self) -> Path:
        filename = Path("contracts") / "catalog_metadata.sample.json"
        for parent in Path(__file__).resolve().parents:
            candidate = parent / filename
            if candidate.exists():
                return candidate
        return Path.cwd() / filename
