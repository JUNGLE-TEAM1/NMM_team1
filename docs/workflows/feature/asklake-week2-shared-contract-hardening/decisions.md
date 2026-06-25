# AskLake week 2 shared contract hardening 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Decision Option Brief는 사용하지 않았다. 이번 Phase는 이전 검수에서 확인된 공통 계약 누락을 보강하는 범위이며 새 대안 비교가 필요하지 않았다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| `QueryResult` 위치 | `AIQueryResult.query_result` 내부 객체 | M6 -> M1 소비 경계를 빠르게 안정화하고 별도 Query API는 후속으로 승격 가능하게 하기 위해 | 사용자 `진행해` 요청 / 2026-06-25 |
| Week 2 draft route | `/api/week2/*` draft route로 문서화 | 현재 baseline API와 Target Week 2 fixture 경계를 구분하기 위해 | 공통 hardening Phase / 2026-06-25 |
| storage path pattern | `s3://<bucket>/<domain>/<layer>/run_id=<run_id>/` | M2/M3/M4/M5 산출물과 M6 조회 위치를 같은 규칙으로 맞추기 위해 | 공통 hardening Phase / 2026-06-25 |
| top-level `AIQueryResult.sql`/`rows` | 유지 | M1 표시 편의와 후속 호환성을 위해 유지하되 canonical 결과는 `query_result`로 둠 | 공통 hardening Phase / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| final MinIO endpoint/local fallback path | 실제 환경 확인 필요 | M3/M5 구현 전 | M3/M5 구현 Phase |
| actual Amazon Reviews sample row count | 실제 데이터 확인 필요 | M3 sample reader 구현 전 | M3 구현 Phase |
| existing baseline API와 `/api/week2/*` adapter 방식 | 구현 구조 선택 필요 | M1 API skeleton 구현 전 | M1 구현 Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `QueryResult`를 독립 Query API 계약으로 승격 | M6/M1 외 Query API 소비자가 생김 | `docs/03`에 별도 `contracts/query_result.sample.json` 또는 Query API contract를 추가한다. |
