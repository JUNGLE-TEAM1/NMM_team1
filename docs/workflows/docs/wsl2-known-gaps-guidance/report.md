# WSL2 known gaps guidance 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/wsl2-known-gaps-guidance`, `docs/workflows/docs/wsl2-known-gaps-guidance`
- Date: 2026-06-24
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/04-development-guide.md`, `docs/manual-verification/00-environment-setup.md`, `docs/reports/windows-wsl2-smoke-execution.md`
- Escalated context read: `docs/workflows/chore/cross-platform-tooling/plan.md`, `scripts/start-workflow.sh`
- Context omitted intentionally: runtime source code, API/schema/data contracts, native Windows implementation
- Changed: WSL2 Tier 1 guidance for CRLF checkout, WSL/Windows Git metadata separation, manual verification readiness, follow-up report note
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`
- Remaining: native Windows PowerShell/CMD support, host frontend direct run, automatic existing-clone repair remain out of scope
- Next context: use WSL2 + Docker Desktop integration with a WSL git worktree/clone; only open native Windows support if a real requirement appears
- Risk: docs-only change; does not expand supported runtime behavior
