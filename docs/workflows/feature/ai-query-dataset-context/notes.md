# AI query dataset context 노트

- 2026-06-29: C-7 Phase로 생성했다.
- M6는 생성/등록된 CatalogMetadata와 Target Dataset context를 소비한다.
- 2026-06-30: 범위를 Product Health Gold Catalog 연결로 좁혔다. M6는 CatalogMetadata가 제공하는 `query_table`/`allowed_columns`/`canonical_demo_query`/`storage_uri` 또는 기존 nested `query.*`/`storage.local_fallback_path`만 사용한다.
- `storage_uri`가 local path 또는 `file://` URI일 때만 DuckDB local fallback path로 전달한다. `s3://`, `http://`, `https://`는 이번 Phase에서 local DuckDB 입력으로 해석하지 않는다.
- Product Health risk/demo 질문은 Catalog의 `canonical_demo_query`를 우선 사용하되, 실행 전 `DuckDBSqlEngine`의 SELECT-only/table/column/LIMIT/path guardrail을 그대로 통과해야 한다.
