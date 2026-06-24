# Cross-platform tooling 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: harness/status/smoke script 동작이 바뀌므로 regression evidence가 필요했다.
- Failing test first: baseline WSL2 재현에서 `./scripts/validate-harness.sh`는 usable `rg`가 없어 noisy failure를 냈고, `./scripts/smoke-container-app.sh`는 missing buildx plugin으로 즉시 실패했다.
- Expected failure command/result: `./scripts/validate-harness.sh` / `./scripts/validate-harness.sh --strict`에서 `rg` permission denied; `./scripts/smoke-container-app.sh`에서 `fork/exec /usr/local/lib/docker/cli-plugins/docker-buildx: no such file or directory`
- Pass command/result: fallback 추가 후 `./scripts/validate-harness.sh`, `./scripts/validate-harness.sh --strict`, `./scripts/test-harness.sh`, `./scripts/smoke-container-app.sh`, `git diff --check`가 통과했다.
- Refactor notes: shared portability helper로 `rg` fallback과 Python launcher 탐색을 공통화했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| shell syntax | `bash -n scripts/start-workflow.sh scripts/status-workflow.sh scripts/validate-harness.sh scripts/test-harness.sh scripts/smoke-container-app.sh scripts/lib/portable-tools.sh` | passed | no shell syntax errors |
| helper syntax | `python3 -m py_compile scripts/lib/portable_rg.py` | passed | portable Python helper compiled |
| local tool readiness | `git --version`; `docker --version`; `docker compose version`; `bash --version`; `curl --version`; `python3 --version`; `node --version`; `npm --version`; `rg --version`; `docker info` | passed-with-skips | `node` missing, `rg` native command unusable, but harness scripts now use Python fallback and Docker daemon is reachable |
| harness validation | `./scripts/validate-harness.sh` | passed | WSL2 shell에서 Python fallback search backend로 통과 |
| strict harness validation | `./scripts/validate-harness.sh --strict` | passed | current workspace draft state를 고려한 strict validation 통과 |
| harness regression | `./scripts/test-harness.sh` | passed | 18개 fixture pass, `ASKLAKE_FORCE_PORTABLE_RG=1`로 fallback path도 검증 |
| smoke | `./scripts/smoke-container-app.sh` | passed | initial buildx failure 후 local-only fallback 재시도로 container smoke 통과 |
| lint | `git diff --check` | passed | no whitespace errors |

## CI/CD Gate / CI-CD 게이트

- CI required: local equivalent only until PR is requested
- CI result: local harness validation, strict validation, harness regression, and WSL2 container smoke passed
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: smoke는 `docker-buildx` missing 오류 뒤 `DOCKER_BUILDKIT=0`, `COMPOSE_DOCKER_CLI_BUILD=0`, temporary local `DOCKER_CONFIG` fallback으로 자동 재시도했다.

## Harness Test Update Gate

- Harness test impact: updated
- Reason: `validate-harness.sh`, `status-workflow.sh`, `test-harness.sh`, `smoke-container-app.sh`, `start-workflow.sh`의 WSL2 portability 동작이 바뀌었다.
- Validation command/result: `./scripts/test-harness.sh` passed

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| native Windows PowerShell/CMD smoke | 이번 Phase는 WSL2 Tier 1 경로와 repo-local fallback에 집중했다 | no |
| host frontend direct run | host `node`가 없어서 Docker Compose 경로만 검증했다 | no |
