# Windows WSL2 smoke audit 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full Decision Option Brief not used. 이번 Phase는 실행 불가 evidence gap과 handoff 명령을 기록하는 docs-only 작업이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Windows WSL2 smoke | not executed here | current environment is macOS, not Windows WSL2 | user request / 2026-06-24 |
| native Windows support | keep not guaranteed | no native PowerShell/CMD evidence or tooling exists | user request / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Windows WSL2 evidence | requires Windows machine | teammate runs handoff commands | `docs/windows-wsl2-smoke-audit` update or follow-up |
| cross-platform tooling | no Windows failure evidence yet | WSL2/native Windows smoke fails or native support becomes required | `chore/cross-platform-tooling` |
| local cleanup | unrelated dirty files and stale branches need human confirmation | user asks cleanup or PR packaging needs it | `chore/local-branch-cleanup` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Windows WSL2 smoke fails | Docker/tool/path/line-ending issue appears | create `chore/cross-platform-tooling` with failure evidence |
