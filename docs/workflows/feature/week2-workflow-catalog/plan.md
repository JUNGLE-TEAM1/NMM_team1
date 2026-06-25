# Week 2 Workflow Catalog 계획

## 브랜치

- Branch: `codex/week2-workflow-catalog`
- Workspace: `docs/workflows/feature/week2-workflow-catalog`
- Created: 2026-06-25

## 목표

- M5 Workflow/Catalog가 Week 2 fixture contract를 실제 backend API에서 소비할 수 있도록 얇은 runtime slice를 만든다.
- `WorkflowDefinition`으로 run을 trigger하고, M1/M6가 소비할 `ExecutionResult`와 `CatalogMetadata`를 조회할 수 있게 한다.

## 범위

- `POST /api/week2/workflows/{pipeline_id}/runs`
- `GET /api/week2/runs/{run_id}`
- `GET /api/week2/catalog/{dataset_id}`
- `contracts/workflow_definition.sample.json`, `contracts/execution_result.sample.json`, `contracts/catalog_metadata.sample.json` 로드
- local runner fallback compatible status와 node-level `task_results[]` 생성
- Airflow adapter boundary와 fallback threshold 적용
- Week 2 execution metric semantics lock
- focused backend contract tests

## 범위 제외

- 실제 Airflow DAG 구현
- 실제 외부 Airflow webserver/scheduler/API 연결
- 실제 Parquet 생성 또는 MinIO 업로드
- 실제 Catalog DB persistence
- M1 UI route 구현
- M3 JSON schema inference/normalize 구현
- M6 SQL/RAG/AI query 구현

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`

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

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
