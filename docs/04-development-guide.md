# 04. 개발 가이드

이 문서는 AskLake 개발 운영 규칙을 정의한다. Phase 순서와 복사용 프롬프트는 `docs/08-development-workflow.md`, 회귀/실패 기준은 `docs/06-regression-and-failure-scenarios.md`, 수동 검증은 `docs/07-manual-verification-playbook.md`에 둔다.

## 1) 개발 원칙

- `docs/08`의 Phase 순서를 따른다.
- `AGENTS.md`의 Context Loading Rule을 따른다.
- `docs/15-context-budget-rule.md`에 따라 Lite Read로 시작하고, 위험 신호가 있을 때만 문맥을 확장한다.
- 변경은 현재 Phase 범위 안에 둔다.
- report는 증거로 사용하고 Source of Truth로 사용하지 않는다.

## 2) 브랜치 전략

권장 branch type:

- `feature/[short-kebab-name]`
- `fix/[short-kebab-name]`
- `docs/[short-kebab-name]`
- `test/[short-kebab-name]`
- `chore/[short-kebab-name]`

branch 이름 규칙:

- slash 뒤에는 lowercase kebab-case를 사용한다.
- 이름은 짧고 동작 중심으로 쓴다.
- 공백, 개인 이름, 날짜, issue 설명, secret을 넣지 않는다.
- branch 이름과 `docs/workflows/` 아래 workspace 경로를 맞춘다.
- GitHub issue 번호를 넣기 위해 branch 이름을 바꾸지 않는다. linked issue는 workspace `sync.md`에 기록한다.

예시:

- Branch: `feature/task-board`
- Workspace: `docs/workflows/feature/task-board/`
- Branch: `feature/project-bootstrap`
- Workspace: `docs/workflows/feature/project-bootstrap/`

branch workspace 생성:

```bash
scripts/start-workflow.sh feature project-bootstrap "Project bootstrap"
```

기본 생성된 GitHub issue는 조직 Project `JUNGLE-TEAM1` number `3`에도 추가하고 Status를 `In Progress`로 설정한다.
권한 또는 GitHub CLI 문제로 project 추가가 실패하면 workspace `sync.md`의 `issue project result`에 이유를 기록한다.
`scripts/prepare-pr.sh --close-issue` 또는 `--finalize`가 linked issue close를 확인하면 Project Status를 `Done`으로 설정한다.

## 3) Git sync 규칙

branch 최신성, 통합 안전성의 Source of Truth는 `docs/11-git-sync-policy.md`다.

- 각 Phase는 승인된 최신 `main` 상태에서 시작한다.
- 사람이 pull을 승인하면 기본 main 갱신 명령은 `git pull --ff-only`를 사용한다.
- dirty worktree에서는 sync하지 않는다.
- branch workspace 전환용 checkpoint는 tracked file의 수정/삭제만 자동 포함하고, untracked file과 local artifact는 보고만 한다.
- 시작, 중간, pre-merge, PR 상태를 workspace `sync.md`에 기록한다.
- PR merge 이후 완료 여부는 가능하면 GitHub PR/issue 상태를 기준으로 확인하고, stale `sync.md` final field만으로 active branch로 판단하지 않는다.
- Phase 중 main이 바뀌면 멈추고 rebase/merge, 위험 기록 후 계속 진행, follow-up 분리 중 무엇을 할지 확인한다.
- direct main push보다 PR 기반 통합을 우선한다.
- PR-ready 조건과 stop condition을 통과한 feature branch push/PR 생성은 자동 실행할 수 있다.
- 원격 운영 상태를 직접 보정하고 그 보정을 하네스 스크립트/문서/검증 규칙으로 반영한 변경은 팀 공유 산출물이므로 PR-ready 조건 통과 시 자동 PR 대상이다.
- confirmation gate 없이 merge, rebase, PR merge, finalize, issue close, branch cleanup을 자동 실행하지 않는다.

## 4) Commit 규칙

```text
<type>: <subject>
```

예시:

- `feat: add [feature]`
- `fix: handle [case]`
- `docs: update [document]`
- `test: add [coverage]`

## 5) 테스트 전략

TDD와 CI/CD 정책은 `docs/12-quality-gates.md`를 따른다.

| 수준 | 대상 |
| --- | --- |
| Unit | 필요한 경우 Markdown link와 placeholder 일관성 |
| Integration | 문서 간 Source of Truth 일관성 |
| Smoke | stale example artifact나 의도하지 않은 placeholder를 `rg`로 확인 |
| E2E/manual | `README.md`, `AGENTS.md`, `docs/01~08` 기준 project bootstrap 흐름 확인 |

TDD 기본값:

- core logic, bug fix, regression 위험 동작, integration contract에는 TDD를 적용한다.
- 문서 전용 작업이나 낮은 위험의 기계적 변경에는 선택 사항이다.
- failing-first 증거 또는 skip reason을 workspace `quality.md`에 기록한다.

## 6) 로컬 개발 환경 요구사항

로컬 개발 환경의 Source of Truth는 이 섹션이다.
`README.md`는 빠른 실행 요약만 제공하고, OS별 지원 범위와 검증 기준은 이 문서를 따른다.

### 지원 등급

| 등급 | 환경 | 지원 범위 | 상태 |
| --- | --- | --- | --- |
| Tier 1 | macOS + Docker Desktop + bash-compatible shell | Docker Compose 실행, 하네스 shell script, smoke 검증 | 권장 |
| Tier 1 | Windows + WSL2 + Docker Desktop integration + bash-compatible shell | Docker Compose 실행, WSL2 안에서 하네스 shell script, smoke 검증 | 권장 |
| Tier 2 | native macOS host runtime | backend/frontend 직접 실행 | 보조 경로 |
| Not yet guaranteed | native Windows PowerShell/CMD | Docker Compose 일부 명령은 가능할 수 있으나 `scripts/*.sh` 동일 실행은 미검증 | 후속 검증 필요 |

Windows 개발자는 기본적으로 WSL2 shell에서 repository를 열고 Docker Desktop WSL integration을 켠 상태로 작업한다.
새 Windows 개발 환경은 새 clone 또는 WSL git으로 만든 worktree에서 시작하는 것을 권장한다.
WSL shell에서 사용할 worktree와 branch workspace는 WSL git으로 만들고, Windows shell에서 사용할 worktree는 Windows Git으로 만든다.
한 shell에서 만든 worktree metadata를 다른 shell의 Git 구현으로 재사용하는 것은 보장하지 않는다.
native PowerShell/CMD를 공식 지원하려면 별도 cross-platform smoke audit과 tooling Phase가 필요하다.

### 최소 도구

| 도구 | 필수 여부 | 용도 | 확인 명령 |
| --- | --- | --- | --- |
| Git | 필수 | branch/workspace 관리 | `git --version` |
| Docker Desktop 또는 Docker Engine | 필수 | 권장 local/container 실행 | `docker --version` |
| Docker Compose | 필수 | backend/frontend container 실행 | `docker compose version` |
| bash-compatible shell | 필수 | `scripts/*.sh` 하네스 실행 | `bash --version` |
| ripgrep | 권장 | 문서/하네스 정적 검증 가속. 없으면 harness scripts는 Python fallback search backend를 사용한다. | `rg --version` |
| curl | 필수 | health/smoke HTTP 확인 | `curl --version` |
| Python / `python3` | 필수 | backend test와 smoke JSON parsing | `python3 --version` |
| Node/npm | 선택 | frontend build/dev를 host에서 직접 실행할 때 사용한다. Docker Compose Tier 1 경로만 쓰면 host Node는 필수가 아니다. | `node --version`, `npm --version` |
| GitHub CLI | 선택 | 승인된 issue/PR helper | `gh --version` |
| AWS CLI | 선택 | 승인된 AWS readiness/bootstrap | `aws --version` |

host Python/Node 최소 버전은 아직 별도 pinning하지 않는다.
container 기준은 `infra/docker/backend.Dockerfile`의 Python image, `infra/docker/frontend.Dockerfile`의 Node image, `backend/requirements.txt`, `frontend/package.json`을 따른다.
host native 실행을 Tier 1로 올리려면 Python/Node version pinning을 별도 Phase에서 확정한다.

### 권장 local/container 실행

```bash
docker compose build
docker compose up
curl -fsS http://localhost:8000/health
curl -fsS http://localhost:3000/
```

권장 경로는 Docker Compose다.
이 경로는 host OS 차이를 줄이고 backend Python/runtime, frontend Node/build 환경을 container image에 고정한다.

기본 포트:

- Backend health: `http://localhost:8000/health`
- Frontend: `http://localhost:3000`

자동 smoke 검증은 로컬의 다른 프로젝트와 충돌하지 않도록 backend `18000`, frontend `13000`을 기본 포트로 사용한다.

```bash
scripts/smoke-container-app.sh
BACKEND_PORT=18001 FRONTEND_PORT=13001 scripts/smoke-container-app.sh
```

필요한 경우 Docker Compose 포트도 override한다.

```bash
BACKEND_PORT=8001 FRONTEND_PORT=3001 docker compose up
```

### 하네스 검증 명령

```bash
rg -n "\\[[A-Z0-9_]+\\]" .
scripts/start-workflow.sh --dry-run feature project-bootstrap "Project bootstrap"
scripts/status-workflow.sh docs/workflows/feature/task-board
sed -n '1,220p' docs/15-context-budget-rule.md
git status --short
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
scripts/validate-harness.sh --integration
```

`scripts/*.sh`는 bash-compatible shell을 전제로 한다.
Windows에서는 WSL2 shell에서 실행하는 것을 기본 지원 경로로 둔다.
.gitattributes는 `*.sh`를 LF로 checkout하도록 강제한다.
기존 clone이 이미 CRLF로 checkout돼 있다면 script 실행 오류의 첫 후보로 line ending을 확인한다.
필요하면 affected script를 현재 shell 기준으로 다시 checkout하거나 새 worktree/clone에서 재검증한다.
대량 renormalize diff는 별도 확인 없이 만들지 않는다.
native PowerShell/CMD에서 동등하게 실행하려면 `python3`, `curl`, `rg`, `mktemp`, path separator, line ending, Docker Desktop WSL integration, port conflict를 별도로 확인한다.

### Local Tool/Runtime Readiness

test/build/smoke/manual verification에 필요한 local tool 또는 runtime이 있으면, AI는 validation skip으로 바로 처리하지 않고 먼저 readiness를 확인한다.

예시:

```bash
command -v docker
docker --version
docker compose version
docker info
```

safe start는 아래 조건을 모두 만족해야 한다.

- local-only runtime 기동이다.
- 비용, cloud resource, 외부 production resource를 만들지 않는다.
- secret, credential, license 동의, 관리자 권한 상승, 시스템 설정 변경을 요구하지 않는다.
- branch, remote, Git state를 바꾸지 않는다.

macOS 전용 Docker Desktop safe start 예시:

```bash
test -d /Applications/Docker.app && open -a Docker
for i in $(seq 1 60); do docker info >/tmp/docker-info.log 2>&1 && break; sleep 2; done
```

Windows safe start는 WSL2 + Docker Desktop integration 상태에서 `docker info`로 readiness를 확인한다.
Docker Desktop 설치, WSL2 활성화, license/권한 동의, system service 변경이 필요하면 사람 조치로 기록하고 자동 실행하지 않는다.

repo-local dependency install은 기존 프로젝트 명령 범위 안에서 실행하고 `quality.md`에 기록할 수 있다.

예시:

```bash
cd backend && pip install -r requirements.txt
cd frontend && npm install
```

host-level install, GUI 권한/라이선스 동의, 관리자 권한 상승, system service 설치, 비용/외부 리소스 생성은 사람 확인 없이 실행하지 않는다.
readiness 또는 safe start가 실패하면 실행한 명령, 오류, fallback 시도, 남은 사람 조치를 `quality.md`, Phase report, final response에 구분해서 기록한다.
Docker BuildKit/Compose variant처럼 local-only fallback이 있으면 안전한 범위에서 재시도할 수 있다.

예시:

```bash
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 scripts/smoke-container-app.sh
```

WSL2 + Docker Desktop integration 경로에서 `docker-buildx` plugin이나 `docker-credential-desktop.exe`가 없으면 `scripts/smoke-container-app.sh`는 local-only fallback으로 classic builder와 temporary local `DOCKER_CONFIG`를 자동 재시도한다.

M3 source/catalog API 확인:

```bash
curl -fsS -H "Content-Type: application/json" \
  -d '{"name":"sample_orders","type":"csv","path":"samples/orders.csv"}' \
  http://localhost:8000/api/sources
curl -fsS http://localhost:8000/api/catalog/datasets
```

### 보조 host native 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

cd frontend
npm install
npm run dev
```

host native 실행은 빠른 개발 보조 경로다.
OS별 shell, Python launcher 이름, Node/npm 설치 방식 차이가 있으므로 cross-platform 보장은 Docker Compose 경로를 우선한다.

## 7) PR 체크리스트

- [ ] 현재 Phase에 기여한다.
- [ ] Branch/work location이 `docs/08`과 맞는다.
- [ ] `sync.md` records start sync and pre-merge sync status
- [ ] If the branch has a linked GitHub issue, `sync.md` records it and the PR body includes `Closes #<issue-number>` or an equivalent closing keyword
- [ ] If `scripts/start-workflow.sh` created the linked GitHub issue, `sync.md` records the GitHub Project add and `In Progress` status result
- [ ] If the linked GitHub issue is closed during PR finalize, `sync.md` records the GitHub Project `Done` status result
- [ ] If remote GitHub Issue / Project / PR state was manually reconciled and codified in the harness, workspace evidence records the reconciliation and the PR is auto-created when PR-ready conditions pass
- [ ] 완료 전 main 상태를 확인했거나 위험을 기록했다.
- [ ] test/build/smoke/manual verification 결과를 기록했다.
- [ ] PR handoff 전 `scripts/status-workflow.sh <workspace>`를 확인했다.
- [ ] Regression Guard / Manual Verification을 확인했다.
- [ ] 필요한 문서만 업데이트했다.
- [ ] secret을 commit하지 않았다.
- [ ] data/migration 변경이 있으면 검증했다.

## 8) Secret과 환경 변수 관리

- 실제 secret은 commit하지 않는다.
- `.env.example` 또는 동등한 예시 파일을 최신으로 유지한다.
- 필요한 변수는 실제 값 없이 문서화한다.

## 9) Migration / 데이터 변경 규칙

- schema/data 변경은 `docs/02`와 `docs/03`에 기록한다.
- upgrade/rollback note를 포함한다.
- local 또는 test 환경에서 migration을 검증한다.

## 10) CI/CD 품질 게이트

- 필수 job: lint/test/build 또는 프로젝트에 맞는 동등 명령.
- 하네스 job: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`.
- merge 차단 기준: PR check 통과, `sync.md` 최신, `quality.md` 필수 증거 기록, pending confirmation 없음.
- deployment smoke: MVP 개발 시작 전부터 dev 배포 경로 기준으로 정의한다.
- rollback note: deployment, migration, production 영향 변경에 필수다.
- CD 명령은 사람 확인 뒤에만 실행한다.
- 선택 CI 예시: `.github/workflows/harness-validation.example.yml`

## 11) 인프라 선행 개발 규칙

- 제품 기능 구현 전에 CI/CD, Docker, Kubernetes, AWS foundation Phase를 먼저 진행한다.
- 실제 AWS resource 생성, 비용 발생, 권한 변경은 사람 확인 뒤에만 실행한다.
- AWS bootstrap readiness script는 기본 plan mode로 실행하고, resource 생성은 `--execute`와 승인 환경 값이 모두 있을 때만 실행한다.
- GitHub Actions의 AWS 인증은 장기 access key보다 OIDC role assume 방식을 우선한다.
- Docker image tag는 commit sha 또는 명시적 version을 포함한다.
- Kubernetes manifest 또는 Helm chart는 secret 값을 직접 포함하지 않는다.
- 배포 workflow는 build, test, image publish, deploy, smoke, rollback note를 분리해서 기록한다.
- local/container smoke가 실패하면 cloud deploy를 진행하지 않는다.

## 12) 산출물 위치

| 산출물 | 위치 |
| --- | --- |
| Change propagation layers | `docs/00-layer-map.md` |
| Product scope | `docs/01-product-planning.md` |
| Architecture | `docs/02-architecture.md` |
| Interfaces | `docs/03-interface-reference.md` |
| Acceptance | `docs/05-acceptance-scenarios-and-checklist.md` |
| Evidence | `docs/reports/README.md` |
