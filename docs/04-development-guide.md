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

## 3) Git sync 규칙

branch 최신성, 통합 안전성의 Source of Truth는 `docs/11-git-sync-policy.md`다.

- 각 Phase는 승인된 최신 `main` 상태에서 시작한다.
- 사람이 pull을 승인하면 기본 main 갱신 명령은 `git pull --ff-only`를 사용한다.
- dirty worktree에서는 sync하지 않는다.
- 시작, 중간, pre-merge, PR 상태를 workspace `sync.md`에 기록한다.
- Phase 중 main이 바뀌면 멈추고 rebase/merge, 위험 기록 후 계속 진행, follow-up 분리 중 무엇을 할지 확인한다.
- direct main push보다 PR 기반 통합을 우선한다.
- confirmation gate 없이 merge, rebase, push, PR 생성, PR merge를 자동 실행하지 않는다.

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

## 6) 로컬 실행 명령

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

제품 앱 local/container 실행:

```bash
docker compose build
docker compose up
curl -fsS http://localhost:8000/health
curl -fsS http://localhost:3000/
scripts/smoke-container-app.sh
```

### Local Tool/Runtime Readiness

test/build/smoke/manual verification에 필요한 local tool 또는 runtime이 있으면, AI는 validation skip으로 바로 처리하지 않고 먼저 readiness를 확인한다.

예시:

```bash
command -v docker
docker --version
docker compose version
docker info
```

tool/runtime이 설치되어 있고 local-only safe start가 가능하면 AI가 먼저 실행을 시도한다.

예시:

```bash
test -d /Applications/Docker.app && open -a Docker
for i in $(seq 1 60); do docker info >/tmp/docker-info.log 2>&1 && break; sleep 2; done
```

safe start는 아래 조건을 모두 만족해야 한다.

- local-only runtime 기동이다.
- 비용, cloud resource, 외부 production resource를 만들지 않는다.
- secret, credential, license 동의, 관리자 권한 상승, 시스템 설정 변경을 요구하지 않는다.
- branch, remote, Git state를 바꾸지 않는다.

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

M2 container 포트 기준:

- 일반 개발용 Docker Compose는 backend `8000`, frontend `3000`을 기본 포트로 사용한다.
- 자동 smoke 검증은 로컬의 다른 프로젝트와 충돌하지 않도록 backend `18000`, frontend `13000`을 기본 포트로 사용한다.
- 필요한 경우 `BACKEND_PORT`, `FRONTEND_PORT` 환경 변수로 override한다.

예시:

```bash
BACKEND_PORT=18001 FRONTEND_PORT=13001 scripts/smoke-container-app.sh
BACKEND_PORT=8001 FRONTEND_PORT=3001 docker compose up
```

M3 source/catalog API 확인:

```bash
curl -fsS -H "Content-Type: application/json" \
  -d '{"name":"sample_orders","type":"csv","path":"samples/orders.csv"}' \
  http://localhost:8000/api/sources
curl -fsS http://localhost:8000/api/catalog/datasets
```

개별 runtime 실행:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

cd frontend
npm install
npm run dev
```

## 7) PR 체크리스트

- [ ] 현재 Phase에 기여한다.
- [ ] Branch/work location이 `docs/08`과 맞는다.
- [ ] `sync.md` records start sync and pre-merge sync status
- [ ] If the branch has a linked GitHub issue, `sync.md` records it and the PR body includes `Closes #<issue-number>` or an equivalent closing keyword
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
