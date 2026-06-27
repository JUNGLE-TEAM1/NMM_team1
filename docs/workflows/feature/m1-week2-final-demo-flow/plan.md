# M1 Week2 final demo flow 계획

## 브랜치

- Branch: `feature/m1-week2-final-demo-flow`
- Workspace: `docs/workflows/feature/m1-week2-final-demo-flow`
- Created: 2026-06-27

## 목표

- 최신 Week2 M5/M6 연결 흐름을 M1 화면에서 발표자가 이해하기 쉽게 확인할 수 있게 한다.
- `CatalogMetadata -> DuckDB SQL Query -> evidence` 연결 상태를 UI에 표시하되, backend runner/catalog/query 내부 로직은 변경하지 않는다.

## 범위

- `/catalog` 화면에서 M6 DuckDB query readiness를 확인할 수 있는 작은 상태 표시를 추가한다.
- `/query` 화면에서 DuckDB runtime, SQL rows, evidence 존재 여부를 표시한다.
- `local_path_missing` 실패가 발생하면 먼저 Week2 workflow를 실행해야 한다는 안내를 표시한다.
- M1 최종 데모 흐름 `/etl -> /catalog -> /query` 기준의 build/static 검증을 수행한다.

## 범위 제외

- M5 #200의 `/etl` demo cockpit UI 변경을 이 branch에서 복제하거나 병합하지 않는다.
- M6 #204의 DuckDB runtime wiring을 이 branch에서 구현하지 않는다.
- M4 #197 Kafka replay workflow 연결을 이 branch에서 구현하지 않는다.
- M3 schema/profile/TransformSpec 구현은 다루지 않는다.
- backend API, runner, Catalog store, SQL engine, storage adapter 로직은 변경하지 않는다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- `docs/workflows/feature/m6-duckdb-runtime-integration/report.md` from `origin/feature/m6-duckdb-runtime-integration`
- `docs/workflows/feature/m5-airflow-smoke-integration/report.md` from `origin/feature/m5-airflow-smoke-integration`

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

- [ ] `/catalog` runtime readiness 표시가 frontend build에 포함된다.
- [ ] `/query` runtime/evidence 상태 표시와 `local_path_missing` 안내가 frontend build에 포함된다.
- [ ] M1이 M5/M6 내부 로직을 소유하지 않는다는 범위가 workspace에 기록된다.
- [ ] `cd frontend && npm run build` 통과
- [ ] `git diff --check` 통과
- [ ] `scripts/validate-harness.sh --strict` 통과
- [ ] Report 업데이트
