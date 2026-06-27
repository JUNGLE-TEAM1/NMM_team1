# M2 SQL runtime smoke 계획

## 브랜치

- Branch: `feature/m2-sql-runtime-smoke`
- Workspace: `docs/workflows/feature/m2-sql-runtime-smoke`
- Created: 2026-06-27

## 목표

- M2가 만든 Week 2 Gold output 파일을 `SqlEngineAdapter` 경계 뒤에서 실제 SQL로 읽을 수 있음을 증명한다.
- MVP SQL 구현체는 `DuckDBSqlEngine`으로 두고, M6는 DuckDB를 직접 import하지 않는 기존 adapter 경계를 유지한다.

## 범위

- `CatalogMetadata.storage.local_fallback_path`가 가리키는 local Parquet 또는 JSONL 파일을 SQL table처럼 조회하는 adapter를 추가한다.
- SELECT-only, table allowlist, column allowlist, LIMIT 필수 guardrail을 유지한다.
- `Week2AIQueryService`가 실제 adapter를 주입받으면 fixture row가 아니라 local file 결과를 반환하는 regression test를 추가한다.
- 사람이 재현할 수 있는 Week 2 SQL smoke 스크립트를 추가한다.
- 필요한 Python dependency를 `backend/requirements.txt`에 기록한다.

## 범위 제외

- M6 자연어 SQL planner 고도화.
- RAG/LLM 답변 생성.
- Trino, Athena, production S3 query.
- Airflow DAG 내부에서 SQL task를 실행하는 작업.
- MinIO object를 직접 SQL로 읽는 작업. 이번 Phase는 local fallback path를 기준으로 한다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/workflows/docs/m6-sql-first-week2-buildup/report.md`
- `contracts/catalog_metadata.sample.json`
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
- [x] DuckDB adapter가 Parquet/JSONL local fallback path를 SQL로 조회한다
- [x] AI query service가 실제 SQL 결과를 `AIQueryResult.query_result`에 반영한다
- [x] 수동 smoke script로 workflow 실행 후 SQL 조회가 재현된다
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
