# M6 Hybrid Route 계획

## 브랜치

- Branch: `feature/m6-hybrid-route`
- Workspace: `docs/workflows/feature/m6-hybrid-route`
- Created: 2026-06-29

## 목표

- M6 Step 7로 질문을 `sql`, `rag`, `hybrid`, `unsupported` 중 하나로 결정하는 deterministic route layer를 추가한다.
- 기존 SQL-first 실행은 유지하되, 사용자가 근거/스키마/라인리지 설명을 함께 요구하면 SQL 결과와 Catalog RAG-lite evidence를 함께 쓰는 `hybrid` route를 반환한다.
- SQL이 필요 없는 CatalogMetadata 설명 질문은 SQL engine을 호출하지 않고 `rag` route로 답한다.

## 범위

- `QueryRouter` service와 route decision model 추가.
- 숫자/집계/정렬 질문은 기존 SQL 실행을 유지한다.
- 근거/스키마/메트릭/라인리지 설명 의도가 SQL 질문과 함께 있으면 `hybrid`로 분류한다.
- 스키마/라인리지/카탈로그 설명만 필요한 질문은 `rag`로 분류하고 SQL validate/execute를 호출하지 않는다.
- 예측/미래/매출/감성 등 현재 금지된 질문은 기존처럼 `unsupported`로 block한다.
- `Week2AIQueryService` summary가 route에 맞게 SQL 결과와 CatalogMetadata evidence 사용 여부를 설명한다.
- focused tests로 route classification, hybrid execution, RAG-only no-SQL behavior, unsupported guardrail 유지 여부를 검증한다.

## 범위 제외

- external LLM 답변 생성.
- external embedding provider 또는 vector DB.
- 범용 NL2SQL.
- M1 UI 변경.
- M5 Catalog 저장/수정.
- SQL planner intent 확장.
- RAG-only 자연어 생성 고도화. 이번 Phase는 CatalogMetadata 기반 deterministic summary까지만 다룬다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md` M6 `route`/`retrieval_trace` contract
- `docs/05-acceptance-scenarios-and-checklist.md` Ask route acceptance
- `docs/06-regression-and-failure-scenarios.md` M6 route/retrieval trace regression
- `docs/07-manual-verification-playbook.md` product risk M6 manual check
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md` M6 build-up order
- `docs/reports/m6-catalog-rag-index.md`
- `backend/app/services/ai_query.py`
- `backend/app/services/sql_planner.py`
- `backend/app/services/catalog_retriever.py`
- `backend/tests/test_week2_ai_query.py`

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

- [x] `QueryRouter`가 `sql`, `rag`, `hybrid`, `unsupported` route를 deterministic하게 결정한다.
- [x] SQL-only 질문은 기존처럼 `route=sql`이고 SQL 실행 결과를 반환한다.
- [x] SQL + 근거 질문은 `route=hybrid`이고 SQL rows와 Catalog RAG-lite trace/evidence를 함께 반환한다.
- [x] Catalog metadata 설명 질문은 `route=rag`이고 SQL engine validate/execute를 호출하지 않는다.
- [x] unsupported 질문은 SQL/RAG answer처럼 성공 처리하지 않고 block한다.
- [x] 기존 `AIQueryResult` additive contract와 M1 소비 필드는 깨지지 않는다.
- [x] focused tests, backend tests, contract JSON, harness validation 결과가 `quality.md`와 report에 기록된다.
