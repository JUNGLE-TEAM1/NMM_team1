# M6 Week2 plan boundary update 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 해당 없음. 이번 branch는 이미 합의된 M6 SQL-first 방향을 문서에 반영하는 저위험 docs 작업이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M6 Week2 후속 개발 경계 문서화 | SQL-first, Catalog read-only, adapter-only SQL, additive response fields | 직전 충돌 점검에서 M1~M5와 충돌하지 않는 조건으로 확인한 기준이다. | 사용자 요청 / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `route`, `retrieval_trace` 실제 schema/sample 반영 | 이번 branch는 계획 문서 반영만 수행한다. | M6 response contract implementation slice 시작 시 | 후속 M6 contract PR |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| M6 boundary 문서 | 후속 구현이 M5 Catalog 저장/API, M2 runtime 설치, M1 UI 구현을 직접 수정하려는 경우 | 구현 전 scope를 분리하고 해당 모듈 owner 문서를 먼저 갱신한다. |
