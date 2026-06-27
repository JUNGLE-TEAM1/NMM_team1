# M6 DuckDB runtime integration 계획

## 브랜치

- Branch: `feature/m6-duckdb-runtime-integration`
- Workspace: `docs/workflows/feature/m6-duckdb-runtime-integration`
- Created: 2026-06-27

## 목표

- M6 Step 3로 기존 `FakeSqlEngine` 기본 연결을 `DuckDBSqlEngine` 기본 연결로 전환한다.
- `/api/week2/ai/query`가 M5/Week2 local runner가 저장한 `CatalogMetadata.storage.local_fallback_path`의 실제 JSONL/Parquet output을 SQL로 읽어 `QueryResult.engine="duckdb"`를 반환하게 한다.
- `SqlEngineAdapter` 경계는 유지해서 M6 service가 DuckDB를 직접 import하지 않게 한다.

## 범위

- `AppContainer` SQL engine factory를 설정 기반으로 정리하고, 기본값은 Week 2 MVP 기준인 DuckDB로 둔다.
- 테스트에서는 필요할 때 fake engine을 명시적으로 선택할 수 있게 한다.
- Week2 workflow run 후 생성된 CatalogMetadata/output file을 M6 query가 DuckDB로 읽는 integration test를 추가한다.
- `/query` 화면이 사용하는 기존 `AIQueryResult` public shape는 유지한다.

## 범위 제외

- SQL planner 고도화, semantic/RAG index, retrieval trace public contract 추가.
- 외부 LLM/vector DB/Trino/Athena 연결.
- M5 Catalog 저장/수정 책임 변경.
- M1 UI 레이아웃 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md` Week 2 SQL execution adapter boundary
- `docs/05-acceptance-scenarios-and-checklist.md` Week 2 / Ask evidence checkpoint
- `docs/06-regression-and-failure-scenarios.md` evidence, processing integrity guard
- `docs/07-manual-verification-playbook.md` Week 2 / Ask evidence verification
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`

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

- not needed. 이번 Phase는 한 가지 의미 단위인 `DuckDB runtime integration`만 다룬다.

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

- [x] `AppContainer` 기본 M6 SQL engine이 DuckDB이고, fake는 명시 설정으로만 선택된다.
- [x] Week2 local runner 산출물 기반 `POST /api/week2/ai/query` 결과가 `query_result.engine="duckdb"`를 반환한다.
- [x] 반환 row가 fake fixture가 아니라 local output file에서 온 값임을 테스트로 확인한다.
- [x] 기존 focused M6/DuckDB/backend tests가 통과한다.
- [x] Acceptance, Regression/failure scenario, Manual verification 결과가 `quality.md`와 `report.md`에 기록된다.
