from typing import Any, Protocol


class CatalogSource(Protocol):
    def list_catalogs(self, tenant_id: str | None = None) -> list[dict[str, Any]]: ...
