# M5 direct spark_runner 제거 Hotfix sources

## Primary Context

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/07-manual-verification-playbook.md`
- `backend/app/services/week2_workflow.py`
- `backend/tests/test_week2_workflow_catalog.py`

## Evidence Context

- GitHub issue `#287`
- `docs/workflows/codex/m5-runner-selection-catalog-guard/report.md`

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
| n/a | n/a | n/a | 2026-06-29 | 별도 source branch 통합 없음 |

## Integration Notes / 통합 메모

- 별도 source branch dependency는 없다.

## Context Budget

- Mode: Escalate Read
- Reason: M5 API executor contract와 acceptance/manual verification 문구를 함께 변경했다.

## Direct Files

| Source | Path | Note |
| --- | --- | --- |
| Current Source of Truth | `docs/03-interface-reference.md` | Week 2 workflow executor contract |
| Current tests | `backend/tests/test_week2_workflow_catalog.py` | M5 workflow API/service guard |
| Current service | `backend/app/services/week2_workflow.py` | M5 executor selection implementation |
| Issue | https://github.com/JUNGLE-TEAM1/NMM_team1/issues/287 | User-requested hotfix scope |
