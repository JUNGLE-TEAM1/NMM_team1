# M1 final browser smoke 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

-

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M1 후속 Phase Queue 추가 | `m1-live-ui-phase-plan.md`에 Phase 6~10을 추가 | 사용자가 M1이 지금 할 수 있는 일을 모두 수행할 수 있게 Phase들을 생성하라고 지시했고, 한 번에 여러 구현을 하지 않는 하네스 규칙에 맞춰 Phase queue로 분리했다. | 사용자 지시 / 2026-06-28 |
| Phase 6 범위 | browser smoke evidence only | 제품 코드/UI 수정 없이 최신 main 기준 `/etl -> /catalog -> /query` 검증을 수행한다. 발견된 UI gap은 후속 Phase로 넘긴다. | 사용자 지시 / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
|  |  |  |  |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| M1 후속 Phase Queue | M2/M3/M5/M6 계약 또는 Product Health 대표 경로가 바뀐다. | 해당 Phase plan의 범위/선행 조건을 갱신한다. |
| Phase 6 smoke evidence only | `/etl` CTA gap을 이번 Phase에서 고쳐야 한다는 별도 지시가 온다. | 새 UI fix Phase를 만들거나 현재 Phase scope change를 기록한다. |
