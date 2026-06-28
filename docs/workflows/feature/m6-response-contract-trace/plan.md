# M6 response contract route and retrieval trace 계획

## 브랜치

- Branch: `feature/m6-response-contract-trace`
- Workspace: `docs/workflows/feature/m6-response-contract-trace`
- Created: 2026-06-28

## 목표

- M6 Step 5로 `AIQueryResult` 응답에 `route`와 `retrieval_trace`를 additive field로 추가한다.
- M1과 report가 M6 내부 scoring을 다시 계산하지 않아도, 이번 답변이 SQL/RAG/Hybrid/Unsupported 중 어떤 경로였는지와 어떤 CatalogMetadata 근거를 사용했는지 볼 수 있게 한다.
- 현재 구현된 SQL-first 흐름은 유지하고, 후속 RAG/Hybrid/LLM 확장에 필요한 public response surface만 먼저 고정한다.

## 범위

- `RetrievalTraceItem` domain model 추가.
- `AIQueryResult.route`를 `sql`, `rag`, `hybrid`, `unsupported` 중 하나로 노출.
- 현재 SQL-first M6에서 지원되는 SQL 질문은 `route=sql`, 지원하지 않는 질문은 `route=unsupported`로 반환.
- Catalog retrieval score, matched terms, selected evidence index를 `retrieval_trace`에 포함.
- `contracts/ai_query_result.sample.json`, `docs/03`, `docs/05`, `docs/06`, `docs/07`에 response contract와 검증 기준 반영.
- 기존 DuckDB-backed M6 query, SQL planner, unsupported guardrail regression test를 유지하면서 route/trace assertion 추가.

## 범위 제외

- Catalog RAG index 구현.
- Hybrid route 실행.
- 외부 LLM 답변 생성.
- M1 UI 표시 변경.
- M5 Catalog 저장/수정 책임 변경.
- 범용 NL2SQL 또는 질문 해석 방식 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md` Week 2 `AIQueryResult` / Ask Evidence contract
- `docs/05-acceptance-scenarios-and-checklist.md` Week 2 Ask/Evidence acceptance
- `docs/06-regression-and-failure-scenarios.md` M6 route/evidence regression
- `docs/07-manual-verification-playbook.md` product risk M6 manual check
- `docs/reports/m6-duckdb-runtime-integration.md`
- `docs/reports/m6-sql-planner-intents.md`
- `backend/app/domain/ai_query.py`
- `backend/app/services/ai_query.py`
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

- not needed. 이번 Phase는 한 의미 단위인 `M6 response contract route and retrieval trace`만 다룬다.

## 완료 기준

- [x] `AIQueryResult.route`가 public response model에 추가된다.
- [x] `AIQueryResult.retrieval_trace[]`가 public response model에 추가된다.
- [x] SQL-first 성공/blocked 응답은 `route=sql`을 반환한다.
- [x] 지원하지 않는 질문은 SQL engine 호출 없이 `route=unsupported`와 `blocked/unsupported_question`을 반환한다.
- [x] Catalog 기반 trace가 `source_type`, `source_id`, `score`, `matched_terms`, `evidence_index`를 포함한다.
- [x] `contracts/ai_query_result.sample.json`이 새 field를 포함한다.
- [x] `docs/03`, `docs/05`, `docs/06`, `docs/07`에 계약/수용/회귀/수동검증 기준이 반영된다.
- [x] Focused M6/SQL/DuckDB tests가 통과한다.
- [x] Full backend/harness validation 결과가 `quality.md`와 report에 기록된다.
