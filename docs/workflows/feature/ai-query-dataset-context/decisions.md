# AI query dataset context 결정 기록

- Decision status: accepted

| Decision | Status | Rationale |
| --- | --- | --- |
| route scope | accepted | MVP는 CatalogMetadata 기반 read-only SQL/evidence 결과를 우선한다. |
| Catalog alias support | accepted | PR 5/6 Catalog 등록 PR과 병렬 통합하기 위해 nested `query.*`와 top-level `query_table`/`allowed_columns`/`canonical_demo_query`를 모두 소비한다. |
| local storage URI handling | accepted | `storage_uri`가 local path 또는 `file://` URI이면 `SqlEngineContext.local_fallback_path`로 전달한다. |
| remote storage URI handling | deferred | `s3://`, `http://`, `https://` URI는 이번 Phase에서 DuckDB local input으로 해석하지 않는다. |
| RAG/LLM 확장 | deferred | SQL MVP 이후 별도 Phase로 판단한다. |

## Decision Option Briefs / 결정 옵션 브리프

- not needed yet

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Catalog alias support | nested + top-level alias read compatibility | PR 5/6과 PR 7을 병렬 가능하게 하면서 기존 `contracts/catalog_metadata.sample.json` shape를 깨지 않기 위해 | AI implementation / 2026-06-30 |
| Product Health demo SQL | use `canonical_demo_query` when present | AI Query가 직접 SQL/output path를 추측하지 않고 CatalogMetadata가 제공한 Gold query context를 기준으로 조회하게 하기 위해 | AI implementation / 2026-06-30 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| remote/object `storage_uri` DuckDB execution | local credentials, MinIO/S3 auth, remote read policy는 이번 C-7 범위를 넘는다 | PR 5/6이 local fallback 없이 remote-only URI만 제공할 때 | follow-up M5/M6 storage policy Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
