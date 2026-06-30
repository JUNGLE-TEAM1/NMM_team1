# Catalog payload 기반 Catalog 등록 노트

- 기존 M5 Catalog 등록은 runner `output_path`와 template storage prefix로 Catalog URI를 계산했다.
- 새 handoff에서는 PR 5A Manual Run result가 `catalog_payload.storage_uri`를 제공하므로, PR 6은 해당 값을 canonical output location으로 써야 한다.
- `catalog_payload.storage_uri`가 S3-compatible URI이면 `storage.local_fallback_path`는 `null`로 둔다. local path 또는 `file://` URI일 때만 local fallback path로 채운다.
- legacy `s3_uri` 소비자가 남아 있으므로 `catalog_payload` 경로에서는 `CatalogMetadata.s3_uri`가 `storage_uri`를 mirror한다.
- `catalog_payload`가 없는 기존 local/spark runner는 기존 계산 경로를 유지한다.
