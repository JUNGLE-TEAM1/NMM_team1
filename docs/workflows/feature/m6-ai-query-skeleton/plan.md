# M6 AI Query 스켈레톤 계획

## 브랜치

- Branch: `feature/m6-ai-query-skeleton`
- Workspace: `docs/workflows/feature/m6-ai-query-skeleton`
- Created: 2026-06-25

## 목표

- M6가 `CatalogMetadata`를 소비해 질문에 맞는 dataset을 고르고, 안전한 SQL과 `AIQueryResult`를 반환하는 최소 backend skeleton을 만든다.
- 2주차 목표 기준으로 실제 LLM/DuckDB 연결 전에도 M1 UI와 M6가 같은 응답 계약으로 통합을 시작할 수 있게 한다.

## 범위

- `POST /api/week2/ai/query` draft route 추가.
- `contracts/catalog_metadata.sample.json` 기반 Metadata Retrieval.
- template SQL 생성: 리뷰 수/인기 상품 중심의 fixture 질문 흐름.
- `SqlEngineAdapter` Python boundary 추가.
- SELECT-only, table allowlist, column allowlist, `LIMIT` 필수 guardrail.
- fake SQL engine으로 `QueryResult` shape 반환.
- `AIQueryResult.query_result`와 top-level `sql`/`rows` mirror 보장.
- focused backend tests 추가.

## 범위 제외

- 실제 DuckDB, Trino, Athena client 연결.
- 외부 LLM 호출 또는 API key 사용.
- vector DB 또는 embedding 기반 semantic search.
- Day 4 검증 질문 3개 확정.
- 실제 Amazon Reviews Parquet row 수 검산.
- M1 UI 화면 구현.
- M3/M5 Catalog 생산 로직 구현.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`의 `AskLake Week 2 Contract Package`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`의 M6와 SQL Engine Adapter 섹션
- `contracts/catalog_metadata.sample.json`
- `contracts/ai_query_result.sample.json`
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

- [ ] `POST /api/week2/ai/query`가 fixture `CatalogMetadata`를 사용해 `AIQueryResult`를 반환한다.
- [ ] SQL guardrail이 non-SELECT, allowlist 밖 table/column, `LIMIT` 없는 SQL을 막는다.
- [ ] `AIQueryResult.query_result.sql`과 top-level `sql`이 일치한다.
- [ ] `AIQueryResult.query_result.rows`와 top-level `rows`가 일치한다.
- [ ] M6 코드가 DuckDB, Trino, Athena를 직접 import하지 않는다.
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
