# M1 live UI Phase plan 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

| Decision | Options Considered | Selected | Reason |
| --- | --- | --- | --- |
| M1 후속 작업 분할 | 단일 대형 UI PR / 5개 작은 Phase / M5/M6 merge 후 보류 | 5개 작은 Phase | PR size, review 비용, 책임 경계를 작게 유지한다. |

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M1 후속 작업 분할 | API client, run UI, catalog UI, AI Query UI, demo polish 5개 Phase | PR size와 책임 경계를 작게 유지하기 위해 | 사용자 요청 / 2026-06-26 |
| M1 책임 경계 | M5/M6 API 소비와 화면 상태 표시까지만 포함 | schema, runner, catalog store, query 로직 중복 구현 방지 | Week2 ver2 문서 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 chart library | Week2 기본 E2E는 chart spec 표시만으로 충분 | AI Query live UI 이후 dashboard polish | post-M1 demo polish |
| M2/M3/M4 evidence 카드 | 각 모듈 evidence path가 준비된 뒤 표시 | Taxi/Kafka evidence PR merge 후 | follow-up evidence UI |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 5개 Phase 분할 | implementation 중 PR들이 지나치게 작아져 handoff 비용이 커짐 | Phase 2~3 또는 Phase 4~5 병합 여부를 다시 판단 |
