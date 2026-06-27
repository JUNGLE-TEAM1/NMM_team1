# PR/Issue/Project guardrail Hotfix sources

## Source Branch Workspaces / source branch workspace

- 없음

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

이번 Hotfix는 별도 source branch handoff가 없지만, decisions.md handoff 기준을 명시하기 위해 `decisions.md`를 required source file에 포함한다.

## Source Branch Base Records / source branch 기준 기록

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| n/a | n/a | n/a | 2026-06-27 | single Hotfix workspace |

## Primary Sources / 주요 source

| Source | Reason |
| --- | --- |
| `AGENTS.md` | Hotfix/workflow/source of truth 규칙 |
| `docs/00-layer-map.md` | System guardrail / quality / git sync 영향 계층 확인 |
| `docs/system-guardrails.md` | guardrail inventory |
| `docs/12-quality-gates.md` | CI/check gate 기준 |
| `docs/11-git-sync-policy.md` | PR/Issue/Project lifecycle 기준 |
| `docs/13-human-command-flow.md` | 사람 명령 응답 기준 |

## Integration Notes / 통합 메모

- 기존 열린 PR/Issue/Project 원격 상태는 읽기 전용 감사만 수행한다.
