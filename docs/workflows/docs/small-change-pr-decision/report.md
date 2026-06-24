# Small change PR decision 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/small-change-pr-decision`, `docs/workflows/docs/small-change-pr-decision`
- Date: 2026-06-24
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08`, `docs/09`, `docs/10`, `docs/13`
- Escalated context read: not needed
- Context omitted intentionally: product planning, architecture, interface, runtime code
- Changed: small change PR decision rules added to workflow, collaboration agreement, next action menu, human command flow, and report index
- Verified: `rg` terminology check, `scripts/validate-harness.sh --strict`, `scripts/test-harness.sh`, `git diff --check`
- Remaining: PR/push/handoff는 요청되지 않아 실행하지 않음. `scripts/start-workflow.sh` dirty checkpoint hardening은 별도 후보로 남김.
- Next context: 작은 변경 완료 후 PR 여부가 애매하면 `Small Change Completion Decision`을 사용한다.
- Risk: script-level dirty checkpoint hardening is deferred. 이번 branch에서는 개인 초안과 `.DS_Store`를 Git 추적에서 제외했다.
