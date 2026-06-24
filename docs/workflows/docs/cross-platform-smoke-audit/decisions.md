# Cross-platform smoke audit 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full Decision Option Brief not used. This Phase records evidence only and does not choose a new tooling direction.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| audit scope | macOS smoke now, Windows evidence later | current machine is macOS only | user request / 2026-06-24 |
| tooling change | defer | no Windows failure evidence yet | user request / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Windows WSL2 support evidence | no Windows WSL2 environment in this run | Windows teammate or machine runs smoke commands | follow-up audit |
| native Windows tooling | native support remains unverified | native Windows becomes required or smoke fails outside WSL2 | `chore/cross-platform-tooling` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
|  |  |  |
