# Source of truth alignment 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full Decision Option Brief는 작성하지 않음. 새 제품 선택이 아니라 이미 구현/결정된 내용을 Source of Truth에 전파하는 docs-only branch다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Source of Truth alignment | 현재 구현 상태를 기준으로 `docs/01`, `docs/02`, `docs/03`, `docs/07`를 갱신 | M3~M5 구현 후 workspace에는 기록됐지만 main 문서에 남은 후보 표현을 제거하기 위해 | user request / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| broader docs audit | 모든 docs/report의 역사적 문구까지 고치는 것은 churn이 큼 | 다음 기능 branch에서 같은 유형의 혼선이 반복될 때 | future docs audit |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Source of Truth alignment | 구현이 다시 바뀌면 | 해당 feature branch에서 main Source of Truth 문서를 함께 갱신 |
