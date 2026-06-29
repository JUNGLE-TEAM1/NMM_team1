# Source dataset persistence 결정 기록

- Decision status: mixed

| Decision | Status | Rationale |
| --- | --- | --- |
| ingest 실행 | deferred | C-2는 metadata 저장만 담당하고 runtime 실행은 C-4/C-5로 넘긴다. |
| schema preview | accepted | M3가 확장 가능한 `ColumnSchema[]` shape로 둔다. |
| persistence boundary | accepted | Source Dataset metadata는 `/api/source-datasets`와 `source_datasets` table에 저장하고 기존 CSV ingest `/api/sources`와 분리한다. |

## Decision Option Briefs / 결정 옵션 브리프

- not needed yet

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Source Dataset persistence boundary | Separate metadata table/API | Existing `/api/sources` performs CSV ingest and catalog dataset creation, which would confuse C-2 demo semantics | Implementation / 2026-06-29 |
| Schema preview shape | `ColumnSchema[]` | Keeps M3 extension path simple while avoiding raw sample ingestion | Implementation / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| ingest/run execution | C-2 is metadata-only | C-4/C-5 runtime handoff | C-4/C-5 |
| Source Dataset to CatalogMetadata publish | Catalog registration belongs after run/evidence | C-6 catalog metadata integration | C-6 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Separate Source Dataset metadata table | Existing `CatalogDataset` becomes the agreed source dataset store | Migrate C-2 API to the agreed store and keep API response compatible |
