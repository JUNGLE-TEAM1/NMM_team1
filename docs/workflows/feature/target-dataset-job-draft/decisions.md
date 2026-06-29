# Target dataset job draft 결정 기록

- Decision status: accepted

| Decision | Status | Rationale |
| --- | --- | --- |
| run 생성 | deferred | C-3은 draft 저장만 담당하고 M5 handoff는 C-4에서 진행한다. |
| schedule 저장 | accepted | 실행 예약이 아니라 job definition draft의 일부로 저장한다. |
| Target Dataset 저장소 | accepted | 기존 실행용 `/api/pipelines`와 분리된 `/api/target-datasets` metadata draft API를 사용한다. |

## Decision Option Briefs / 결정 옵션 브리프

- not needed yet

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Target Dataset draft 저장 | `/api/target-datasets` separate metadata API | 실행 pipeline/run과 섞지 않고 C-4 handoff가 읽을 draft contract를 보존하기 위해 | Phase C-3 implementation / 2026-06-29 |
| schedule field | `schedule` JSON as draft field | 실제 cron persistence 전에도 Review 의도를 저장하기 위해 | Phase C-3 implementation / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| run 생성 | C-3은 draft 저장만 담당 | 저장된 `job_definition`을 M5 run으로 넘길 때 | C-4 `feature/target-dataset-run-handoff` |
| CatalogMetadata 등록 | 실행 결과와 trust/catalog 연결이 필요 | runtime evidence와 CatalogMetadata integration 시작 시 | C-6 `feature/catalog-metadata-integration` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
