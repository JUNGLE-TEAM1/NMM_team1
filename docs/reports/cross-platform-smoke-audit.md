# Cross-Platform Smoke Audit 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-24
- Changed: macOS 로컬 개발 환경의 tool readiness와 Docker Compose smoke evidence를 기록했다.
- Verified: `scripts/smoke-container-app.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`
- Remaining: Windows WSL2와 native Windows PowerShell/CMD smoke는 현재 환경에서 실행하지 못했다.
- Next context: Windows WSL2에서 같은 명령을 실행하거나, native Windows 지원이 필요하면 `chore/cross-platform-tooling`을 시작한다.
- Risk: macOS smoke 통과는 Windows 동등성을 증명하지 않는다.

## Phase

- Type: docs
- Branch/work location: `docs/cross-platform-smoke-audit`, `docs/workflows/docs/cross-platform-smoke-audit`
- Date: 2026-06-24
- Workspace state: complete

## Environment / 환경

- OS: macOS 26.5.1, Darwin 25.5.0, arm64
- Shell: `/bin/zsh`
- Docker: Docker Desktop, ServerVersion `29.4.0`, Architecture `aarch64`
- Docker Compose: `v5.1.2`

## Tool Readiness / 도구 준비 상태

```bash
git version 2.50.1 (Apple Git-155)
Docker version 29.4.0, build 9d7ad9f
Docker Compose version v5.1.2
GNU bash, version 3.2.57(1)-release
ripgrep 15.1.0
curl 8.7.1
Python 3.14.6
node v26.0.0
npm 11.12.1
```

## Smoke Result / Smoke 결과

```bash
scripts/smoke-container-app.sh
```

Result: passed.

Notes:

- Backend and frontend images built successfully.
- Docker Compose started backend/frontend containers on smoke ports.
- Source registration, pipeline creation/run, and result catalog smoke passed.
- A transient `curl: (56) Recv failure: Connection reset by peer` appeared during readiness wait, but the script retried and exited successfully.
- `docker compose -p asklake_container_smoke ps` listed no running smoke containers after cleanup.

## Verification Commands / 검증 명령

```bash
scripts/smoke-container-app.sh
docker compose -p asklake_container_smoke ps
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
git diff --check
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/cross-platform-smoke-audit/quality.md`
- Quality gate status: passed
- TDD status: not applicable, audit-only change
- CI/check result: local smoke and harness validation passed
- Skipped checks: Windows WSL2 smoke, native Windows PowerShell/CMD smoke
- CD/deploy gate: not required

## Manual Verification / 수동 검증

- Document executed: `docs/manual-verification/00-environment-setup.md`, `docs/manual-verification/07-mvp-demo-script.md`
- Environment: macOS + Docker Desktop + bash-compatible shell
- Result: passed for macOS Tier 1 path
- Failure/limitation: Windows paths not executed
- Evidence: command results above

## Next Windows Commands / Windows 후속 검증 명령

Windows WSL2 + Docker Desktop integration shell에서 아래를 실행한다.

```bash
git --version
docker --version
docker compose version
bash --version
rg --version
curl --version
python3 --version
node --version
npm --version
docker info
scripts/smoke-container-app.sh
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```
