# M6 DuckDB SQL engine 계획

## 브랜치

- Branch: `feature/m6-duckdb-sql-engine`
- Workspace: `docs/workflows/feature/m6-duckdb-sql-engine`
- Created: 2026-06-27

## 목표

- M6 2단계로 `DuckDBSqlEngine` adapter를 추가해 `CatalogMetadata.storage.local_fallback_path`의 JSONL/Parquet output을 실제 SQL로 조회할 수 있게 한다.
- `Week2AIQueryService`는 계속 `SqlEngineAdapter`만 알게 하고, DuckDB import는 adapter 내부로 제한한다.

## 범위

- `backend/app/adapters/duckdb_sql_engine.py` 추가.
- `SqlEngineAdapter.validate()`와 같은 guardrail을 DuckDB adapter에도 적용한다.
- `SqlEngineAdapter.execute()`가 JSONL/Parquet local fallback file을 DuckDB table로 등록하고 `QueryResult`를 반환한다.
- DuckDB adapter focused tests를 추가한다.
- `duckdb` backend dependency를 추가한다.
- branch workspace에 TDD, 검증, PR handoff 증거를 기록한다.

## 범위 제외

- container 기본 SQL engine을 DuckDB로 전환하지 않는다.
- 외부 LLM, RAG/vector index, hybrid route는 구현하지 않는다.
- M5 Catalog 저장/수정 로직은 바꾸지 않는다.
- MinIO/S3 remote read는 구현하지 않고 local fallback file만 다룬다.
- 질문 해석/template SQL 생성 범위는 확장하지 않는다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/08-development-workflow.md`
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/workflows/feature/m6-sql-context/report.md`
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

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
- [ ] PR #193 이후 `origin/main` 기준으로 작업하고 PR #182 ordering risk를 확인
