# System guardrail application 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 고영향 option brief는 필요하지 않음. repository admin 설정 없이 repo-local PR check를 추가하는 좁은 운영 변경이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| PR linked issue guardrail 적용 위치 | GitHub Action + repo-local 검사 script | 사람이 판단해야 하는 작업 범위 강제가 아니라 PR 통합 시점의 lifecycle 누락만 시스템이 감지한다. | AI applied from user request / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| branch protection required check 지정 | repo admin 권한이 필요하다. | PR check가 안정적으로 동작하고 팀장이 hard gate를 선택할 때 | follow-up admin task |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| PR linked issue check | 예외 PR이 과도하게 막히거나 no-issue 예외가 남용되는 경우 | label 기반 override 또는 더 엄격한 no-issue 승인 규칙을 별도 Phase에서 검토 |
