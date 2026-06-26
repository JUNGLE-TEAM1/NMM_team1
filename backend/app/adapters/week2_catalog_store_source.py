from typing import Any

from app.ports.catalog_source import CatalogSource
from app.services.week2_catalog_store import Week2CatalogStore


class Week2CatalogStoreSource:
    def __init__(
        self,
        catalog_store: Week2CatalogStore,
        fallback_source: CatalogSource | None = None,
    ) -> None:
        self.catalog_store = catalog_store
        self.fallback_source = fallback_source

    def list_catalogs(self, tenant_id: str | None = None) -> list[dict[str, Any]]:
        stored_catalogs = list(self.catalog_store.load_catalog().values())
        if stored_catalogs:
            return filter_by_tenant(stored_catalogs, tenant_id)

        if self.fallback_source is None:
            return []
        return self.fallback_source.list_catalogs(tenant_id)


def filter_by_tenant(catalogs: list[dict[str, Any]], tenant_id: str | None) -> list[dict[str, Any]]:
    if tenant_id is None:
        return catalogs
    return [catalog for catalog in catalogs if catalog.get("tenant_id") == tenant_id]
