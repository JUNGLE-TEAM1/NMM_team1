# PR risk warning 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 고영향 option brief는 필요하지 않음. 이번 변경은 advisory warning으로 시작하며 merge 차단 정책을 추가하지 않는다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| PR risk warning 적용 방식 | warning-only GitHub Action | PR 크기 판단을 시스템이 보조하되 사람이 최종 판단하도록 한다. | AI applied from user request / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| hard gate / override label | 팀 합의와 repo admin required-check 설정이 필요하다. | advisory warning이 충분하지 않거나 큰 PR 회귀가 반복될 때 | follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| PR risk warning threshold | false positive가 많거나 실제 위험 PR을 놓치는 경우 | threshold와 risky path 목록을 별도 Phase에서 조정 |
