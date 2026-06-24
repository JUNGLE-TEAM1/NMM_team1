# Cross-platform tooling 보고서

## Short Report / 짧은 보고

- Type: chore
- Branch/work location: `chore/cross-platform-tooling`, `docs/workflows/chore/cross-platform-tooling`
- Date: 2026-06-24
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `docs/04-development-guide.md`, `docs/08-development-workflow.md`, `docs/18-harness-regression-policy.md`, `docs/reports/windows-wsl2-smoke-audit.md`
- Escalated context read: previous local `windows-wsl2-smoke-execution` evidence, `scripts/validate-harness.sh`, `scripts/status-workflow.sh`, `scripts/test-harness.sh`, `scripts/smoke-container-app.sh`, WSL2 runtime outputs
- Context omitted intentionally: product architecture/interface/runtime feature docs. 제품 동작은 바꾸지 않았다.
- Changed: `.gitattributes`로 `*.sh` LF checkout 강제, Python `rg` fallback helper 추가, smoke script Docker fallback 추가, start-workflow mismatch hint 추가, WSL2 운영 문서 업데이트, 최신 WSL2 smoke execution report 작성
- Verified: `bash -n ...`, `python3 -m py_compile scripts/lib/portable_rg.py`, `./scripts/validate-harness.sh`, `./scripts/validate-harness.sh --strict`, `./scripts/test-harness.sh`, `./scripts/smoke-container-app.sh`, `git diff --check`, WSL2 readiness commands
- Remaining: host `node`는 여전히 없어서 host frontend direct run은 검증하지 않았다. 기존 CRLF checkout은 현재 shell 기준 재checkout이 필요할 수 있다. mixed Windows Git / WSL git worktree metadata는 clearer error와 docs guidance까지만 보강했다.
- Next context: 이 범위를 docs + tooling 한 PR로 보낼 수 있다. follow-up 후보는 native Windows PowerShell/CMD audit 또는 host direct-run readiness 정리다.
- Risk: WSL2 Tier 1 경로는 repo-local fallback으로 안정화됐지만, native Windows 동일 실행과 host `node` direct run은 여전히 별도 evidence가 필요하다.
