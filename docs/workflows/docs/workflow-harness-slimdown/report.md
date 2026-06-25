# Workflow harness slimdown 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/workflow-harness-slimdown`, `docs/workflows/docs/workflow-harness-slimdown`
- Date: 2026-06-25
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/10-next-action-menu.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/13-human-command-flow.md`, `docs/15-context-budget-rule.md`, `docs/17-parallel-milestone-protocol.md`
- Escalated context read: `docs/18-harness-regression-policy.md`, `docs/reports/_template.md`
- Context omitted intentionally: unrelated Source of Truth docs, historical reports, archived workspaces
- Changed: `docs/08-development-workflow.md`를 router 중심으로 압축하고 하위 정책 상세 반복을 canonical 문서 참조로 정리. 보강으로 provisional milestone 최소 기록 기준과 Source of Truth Impact Gate trigger를 짧게 복원. Workspace evidence 작성.
- Verified: `scripts/validate-harness.sh` passed; `scripts/test-harness.sh` passed 22; `scripts/validate-harness.sh --strict` passed. 제품 acceptance/manual verification 영향 없음 확인.
- Remaining: 기존 hotfix `sync.md` 수정은 이번 PR 범위에서 제외한다.
- Next context: PR에는 `docs/08-development-workflow.md`와 `docs/workflows/docs/workflow-harness-slimdown/`만 포함한다.
- Risk: 정책 의미 변경 없이 문서 압축만 수행했으나, `docs/08`를 많이 줄였으므로 reviewer가 canonical 참조 흐름을 확인해야 한다.
