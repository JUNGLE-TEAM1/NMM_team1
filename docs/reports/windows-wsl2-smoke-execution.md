# Windows WSL2 Smoke Execution 보고서

## Short Report / 짧은 보고

- Type: chore
- Date: 2026-06-24
- Changed: WSL2 shell에서 `rg` fallback, LF checkout, Docker smoke fallback을 repo-local로 보강하고 실제 smoke/harness를 재실행했다.
- Verified: `git --version`, `docker --version`, `docker compose version`, `bash --version`, `curl --version`, `python3 --version`, `npm --version`, `docker info`, `./scripts/validate-harness.sh`, `./scripts/validate-harness.sh --strict`, `./scripts/test-harness.sh`, `./scripts/smoke-container-app.sh`, `git diff --check`
- Remaining: host `node`는 여전히 없고, 기존 CRLF checkout은 현재 shell 기준 재checkout이 필요할 수 있다. mixed Windows Git / WSL git worktree metadata는 clearer error와 docs guidance까지만 보강했다.
- Next context: 이 범위를 docs + tooling 한 PR로 review할 수 있다. follow-up 후보는 native Windows PowerShell/CMD audit 또는 host direct-run readiness 보강이다.
- Risk: WSL2 Tier 1 경로는 repo-local fallback으로 통과했지만, native Windows 동일 실행과 host frontend direct run은 별도 evidence가 남아 있다.

## Phase

- Type: chore
- Branch/work location: `chore/cross-platform-tooling`, `docs/workflows/chore/cross-platform-tooling`
- Date: 2026-06-24
- Workspace state: complete

## Current Environment / 현재 환경

- Host OS: Windows
- Linux runtime: WSL2 Ubuntu 24.04.3 LTS
- Kernel: `6.6.87.2-microsoft-standard-WSL2`
- Repository path in WSL: `/mnt/c/Users/tail1/Documents/나만무 프로젝트/.wsl-worktrees/chore-cross-platform-tooling`

## Tool Readiness / 도구 준비 상태

| Command | Result | Notes |
| --- | --- | --- |
| `git --version` | passed | `git version 2.43.0` |
| `docker --version` | passed | `Docker version 28.3.3` |
| `docker compose version` | passed | `Docker Compose version v2.39.1` |
| `bash --version` | passed | GNU bash 5.2.21 |
| `curl --version` | passed | `curl 8.5.0` |
| `python3 --version` | passed | `Python 3.12.3` |
| `node --version` | skipped | host binary missing, but Docker Compose Tier 1 경로에는 blocker가 아니었다 |
| `npm --version` | passed | `11.3.0` |
| `rg --version` | skipped | native `rg`는 WSL에서 unusable했고, harness scripts는 Python fallback search backend로 통과했다 |
| `docker info` | passed | Docker daemon reachable on WSL2 |

## What Changed / 무엇을 고쳤나

- `.gitattributes`로 `*.sh`를 LF checkout 하도록 강제했다.
- `scripts/validate-harness.sh`, `scripts/status-workflow.sh`, `scripts/test-harness.sh`에 Python 기반 `rg` fallback을 추가했다.
- `scripts/smoke-container-app.sh`에 Python launcher fallback, classic builder fallback, temporary local `DOCKER_CONFIG` fallback을 추가했다.
- `scripts/start-workflow.sh`가 mixed Windows Git / WSL git worktree metadata mismatch를 더 명확히 설명하도록 보강했다.
- `docs/04-development-guide.md`, `docs/07-manual-verification-playbook.md`, `docs/manual-verification/00-environment-setup.md`, `docs/08-development-workflow.md`를 실제 WSL2 운영 기준으로 갱신했다.

## Smoke Result / Smoke 결과

실행:

```bash
./scripts/smoke-container-app.sh
```

결과: **passed**

세부 관찰:

- 첫 시도는 `fork/exec /usr/local/lib/docker/cli-plugins/docker-buildx: no such file or directory`로 실패했다.
- 스크립트가 자동으로 local-only fallback을 적용해 `DOCKER_BUILDKIT=0`, `COMPOSE_DOCKER_CLI_BUILD=0`, temporary local `DOCKER_CONFIG`로 다시 build를 시도했다.
- 재시도 뒤 backend/frontend image build, `docker compose up`, source registration, pipeline run, catalog 확인까지 완료됐다.
- 로그 말미에 transient `curl: (56) Recv failure: Connection reset by peer`가 남았지만 스크립트는 성공 종료했고 `AskLake container smoke passed`를 출력했다.

## Harness Result / 하네스 결과

실행:

```bash
./scripts/validate-harness.sh
./scripts/validate-harness.sh --strict
./scripts/test-harness.sh
git diff --check
```

결과:

- `./scripts/validate-harness.sh`: passed
- `./scripts/validate-harness.sh --strict`: passed
- `./scripts/test-harness.sh`: passed
- `git diff --check`: passed

세부 관찰:

- WSL host의 native `rg`는 여전히 unusable했지만, scripts가 Python fallback search backend를 사용해 noisy failure 없이 통과했다.
- `scripts/test-harness.sh`는 18개 fixture를 통과했고, 일부 fixture는 `ASKLAKE_FORCE_PORTABLE_RG=1`로 fallback path를 명시적으로 검증했다.

## Remaining Gaps / 남은 간격

- host `node`는 여전히 없어 host frontend direct run은 검증하지 않았다.
- 기존 Windows checkout이 이미 CRLF로 내려와 있다면 `.gitattributes`만으로 즉시 복구되지는 않으므로 현재 shell 기준 재checkout 또는 새 worktree/clone이 필요할 수 있다.
- WSL git으로 만든 worktree metadata를 Windows Git에서, Windows Git으로 만든 metadata를 WSL git에서 자동 복구하는 문제는 아직 다루지 않았다. 이번 Phase는 clearer error와 docs guidance까지 보강했다.
- native Windows PowerShell/CMD 지원은 여전히 별도 audit/tooling Phase가 필요하다.

## Follow-up Note / 후속 메모

- 후속 문서 보강은 WSL2 Tier 1 경로를 유지하면서 기존 checkout의 CRLF 확인, 새 WSL worktree/clone 권장, WSL Git / Windows Git metadata 혼용 금지를 운영 지침으로 더 명확히 남기는 방향이 적절하다.
- 이 후속은 과거 smoke evidence를 바꾸지 않고, native Windows PowerShell/CMD 지원 범위를 넓히지 않는다.
