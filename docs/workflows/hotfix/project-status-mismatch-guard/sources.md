# Project status mismatch guard 소스

## Primary Context

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/11-git-sync-policy.md`
- `docs/15-context-budget-rule.md`
- `docs/08-development-workflow.md`
- `scripts/status-workflow.sh`
- `scripts/prepare-pr.sh`
- `scripts/test-harness.sh`

## Evidence Context

- `docs/workflows/hotfix/remote-reconciliation-auto-pr/sync.md`
- GitHub issue `#83` events/timeline 조회 결과
- GitHub Project `3` item status 조회 결과

## Source Branch Workspaces / source branch workspace

-

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| n/a | n/a | n/a | 2026-06-25 | 별도 source branch 통합 없음 |

## Integration Notes / 통합 메모

- 별도 source branch dependency는 없다.

## Context Budget

- Mode: Escalate Read
- Reason: Git sync policy, Project Status lifecycle, harness regression behavior를 변경했다.
