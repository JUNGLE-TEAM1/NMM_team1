# Project issue link Hotfix 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Not needed. The target Project URL was provided directly by the user.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| GitHub Project target | `JUNGLE-TEAM1` Project `3` | user provided the project URL | user / 2026-06-25 |
| Project add failure handling | record failure in `sync.md` instead of blocking workspace creation | branch workflow should continue when GitHub permission is missing | Codex / 2026-06-25 |
| Project Status default | new issues use `In Progress`, historical closed issues use `Done` | user clarified the operational flow | user / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Project target | team moves to a different Project number | update env defaults or docs |
