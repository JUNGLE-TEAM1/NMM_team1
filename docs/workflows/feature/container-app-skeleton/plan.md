# Container app skeleton 계획

## 브랜치

- Branch: `feature/container-app-skeleton`
- Workspace: `docs/workflows/feature/container-app-skeleton`
- Created: 2026-06-22

## 목표

- AskLake M2 범위인 React + FastAPI 앱 골격을 만들고, frontend/backend health 확인과 container build/run 명령을 확정한다.

## 범위

- `backend/` FastAPI 앱 skeleton과 health API를 추가한다.
- `frontend/` React + Vite app shell을 추가하고 backend health 상태를 표시한다.
- `infra/docker/` Dockerfile을 실제 제품 소스 기반 image build로 전환한다.
- `docker-compose.yml`과 container smoke script로 local/container 실행 경로를 확정한다.
- CI container smoke가 backend test, image build, compose smoke를 실행하도록 연결한다.
- M2 실행/검증 명령을 README, 개발 가이드, workspace에 기록한다.

## 범위 제외

- 데이터 소스 등록, pipeline 작성/실행, catalog 기능 구현은 M3~M4로 미룬다.
- AWS resource 생성, ECR push, EKS deploy, production deployment는 실행하지 않는다.
- 인증, multi-tenant, database migration은 이번 branch 범위에 포함하지 않는다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

M2는 작은 제품 skeleton이지만 source, container, CI, 문서가 함께 바뀌므로 아래 내부 단계로 나눠 진행한다.

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step 1 - Backend Health

#### 목표

- FastAPI backend가 local/container/Kubernetes probe에서 사용할 health contract를 제공한다.

#### 범위

- `backend/app/main.py`, `backend/tests/test_health.py`, `backend/requirements.txt`

#### 범위 제외

- connection/pipeline/catalog API 구현

#### 구현 프롬프트

```text
@AGENTS.md @docs/02-architecture.md @docs/03-interface-reference.md @docs/12-quality-gates.md

FastAPI app skeleton과 `/health`, `/api/health` endpoint를 구현한다. health response는 frontend와 smoke test가 확인할 수 있게 안정적인 JSON contract로 둔다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/03-interface-reference.md @docs/12-quality-gates.md

backend health unit/contract test와 container image test command를 실행하고 `quality.md`에 결과를 기록한다.
```

#### 완료 기준

- [x] `/health`와 `/api/health`가 같은 ok contract를 반환한다.

### Step 2 - Frontend App Shell

#### 목표

- React app shell이 AskLake MVP pipeline 후보와 backend health 상태를 보여준다.

#### 범위

- `frontend/` React + Vite skeleton, UI app shell, local dev command

#### 범위 제외

- 실제 source/pipeline/catalog form과 API 연동

#### 구현 프롬프트

```text
@AGENTS.md @docs/02-architecture.md @docs/03-interface-reference.md

React + Vite app shell을 만들고 backend `/api/health`를 호출해 상태를 표시한다. M2 skeleton답게 첫 화면은 사용 가능한 제품 작업대여야 하며 마케팅 landing page로 만들지 않는다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

frontend Docker build와 compose smoke로 정적 앱 로딩을 확인한다.
```

#### 완료 기준

- [x] frontend image build가 성공하고 `http://localhost:3000/`에서 앱이 로드된다.

### Step 3 - Container And CI Smoke

#### 목표

- 모든 팀원이 같은 container 명령으로 backend/frontend를 빌드하고 실행할 수 있게 한다.

#### 범위

- Dockerfile, `docker-compose.yml`, smoke script, CI container-smoke job, README/development guide

#### 범위 제외

- image push, cloud deploy, production release

#### 구현 프롬프트

```text
@AGENTS.md @docs/04-development-guide.md @docs/12-quality-gates.md

제품 소스 기반 Dockerfile로 전환하고 `docker compose` 실행 경로와 smoke script를 만든다. CI는 backend test, image build, compose smoke를 재현해야 한다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

`bash -n scripts/*.sh`, backend test, Docker build, compose smoke, harness strict validation을 실행하고 결과를 workspace에 기록한다.
```

#### 완료 기준

- [x] container build/run smoke 명령이 문서와 CI에 기록된다.

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
