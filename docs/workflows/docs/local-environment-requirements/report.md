# Local environment requirements 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/local-environment-requirements`, `docs/workflows/docs/local-environment-requirements`
- Date: 2026-06-24
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/04-development-guide.md`, `docs/05`, `docs/06`, `docs/07`, `docs/08`, `README.md`
- Escalated context read: `docker-compose.yml`, `infra/docker/backend.Dockerfile`, `infra/docker/frontend.Dockerfile`, `backend/requirements.txt`, `frontend/package.json`, `.env.example`, `scripts/*.sh` search results
- Context omitted intentionally: product architecture/interface full review; no API/schema/data/runtime behavior changed
- Changed: local environment requirements, OS support tiers, WSL2 recommendation, native Windows limitation, manual verification readiness, follow-up cross-platform audit/tooling candidates
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`
- Remaining: actual Windows WSL2/native Windows smoke evidence and cross-platform tooling improvements are follow-up Phase candidates
- Next context: choose PR handoff, local hold, additional wording changes, or `docs/cross-platform-smoke-audit`
- Risk: current changes are docs-only; native Windows support is explicitly not guaranteed until evidence/tooling exists
