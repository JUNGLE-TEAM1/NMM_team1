# M1 final browser smoke 계획

## 브랜치

- Branch: `feature/m1-final-browser-smoke`
- Workspace: `docs/workflows/feature/m1-final-browser-smoke`
- Created: 2026-06-28

## 목표

- 최신 `origin/main` 기준으로 M1 발표 흐름 `/etl -> /catalog -> /query`가 화면에서 끊기지 않는지 browser smoke로 확인한다.
- 이 Phase는 UI 검증 Phase이며, backend schema/runner/query 로직은 변경하지 않는다.

## 범위

- local backend와 frontend dev server를 실행한다.
- `/etl`에서 Week2 workflow 실행 또는 기존 실행 상태를 확인한다.
- `/catalog`에서 Catalog metadata, local output, lineage, query readiness 표시를 확인한다.
- `/query`에서 M6 DuckDB/SQL/evidence 응답 또는 명확한 blocked/empty 상태를 확인한다.
- browser console error와 network failure를 기록한다.
- smoke 결과를 `quality.md`, `report.md`, 필요 시 `docs/reports/`에 기록한다.

## 범위 제외

- `gold_product_health` transform/spec/schema 구현
- M2 5GB runtime evidence 생성
- M5 Catalog 저장 로직 변경
- M6 SQL planner/query backend 변경
- UI 기능 보강. 실패가 발견되면 후속 M1 Phase로 분리한다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- `docs/reports/m1-week2-final-demo-flow.md`
- `docs/reports/m5-airflow-smoke-integration.md`
- `docs/reports/m6-response-contract-trace.md`

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

- not needed

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step N - [STEP_NAME]

#### 목표

- [STEP_GOAL]

#### 범위

- [STEP_SCOPE]

#### 범위 제외

- [STEP_OUT_OF_SCOPE]

#### 구현 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[IMPLEMENTATION_REQUEST]
```

#### 검증 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[VERIFICATION_REQUEST]
```

#### 완료 기준

- [ ] [STEP_COMPLETION_CRITERION]

## 완료 기준

- [ ] local frontend/backend 실행 절차와 포트를 기록한다.
- [ ] `/etl -> /catalog -> /query` browser smoke 결과를 기록한다.
- [ ] console/network error 여부를 기록한다.
- [ ] 성공/blocked/empty 상태가 fake success로 보이지 않는지 확인한다.
- [ ] `cd frontend && npm run build` 통과 또는 skip reason 기록
- [ ] `scripts/validate-harness.sh --strict` 통과 또는 skip reason 기록
- [ ] `quality.md`와 `report.md` 업데이트
