# M6 SQL execution context 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 해당 없음. 이번 branch는 PR #182에서 정리한 M6 1단계 구현을 수행한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M6 SQL context path 전달 | `SqlEngineContext.local_fallback_path` optional field 추가 | DuckDB adapter 전 단계에서 Catalog output path를 SQL adapter boundary로 넘기기 위한 최소 변경이다. | M6 10단계 계획 / 2026-06-27 |
| missing local output path 처리 | `local_path_missing` guardrail blocked | path 없는 Catalog로 SQL 성공 rows를 fabricating하지 않기 위함이다. | M6 10단계 계획 / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| actual file existence/readability validation | Step 1은 path 전달과 missing path guardrail만 다룬다. | DuckDB adapter 또는 SQL guardrail 강화 단계 시작 | M6 Step 2/3 |
| public response `route`/`retrieval_trace` | Step 1 범위 밖 | 응답 계약 보강 단계 시작 | M6 Step 6 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `local_path_missing` | PR #182가 merge되지 않은 상태로 implementation PR을 열어야 하는 경우 | Source of Truth 문서 반영을 같은 PR에 포함할지 재검토한다. |
