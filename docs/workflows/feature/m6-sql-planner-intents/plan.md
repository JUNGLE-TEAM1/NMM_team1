# M6 Catalog-aware SQL planner intent rules 계획

## 브랜치

- Branch: `feature/m6-sql-planner-intents`
- Workspace: `docs/workflows/feature/m6-sql-planner-intents`
- Created: 2026-06-27

## 목표

- M6 Step 4로 template SQL 분기를 `SqlPlanner` 내부 컴포넌트로 분리한다.
- 사용자 질문을 `top_count`, `top_rating`, `top_risk`, `top_negative_review`, `low_conversion`, `top_late_delivery`, `unsupported` 같은 내부 intent로 분류하고, CatalogMetadata의 `query.table_name`, `allowed_columns`, `default_limit`만 사용해 SQL을 만든다.
- 최신 Week2 대표 path가 `dataset_product_health_gold` / `gold_product_health`로 바뀐 점을 반영해 product health 지표 질문을 지원한다.
- 지원하지 않는 질문은 DuckDB/SQL engine을 호출하지 않고 `blocked`로 보류한다.

## 범위

- `SqlPlanner` service 추가.
- `Week2AIQueryService`가 SQL 문자열, chart spec, summary intent를 planner 결과로 사용하도록 연결.
- 리뷰 수/평점 질문은 기존 reviews demo regression으로 유지한다.
- 위험 점수, 부정 리뷰율, 낮은 전환율, 배송 지연율 질문은 `gold_product_health` CatalogMetadata context에서 deterministic SQL로 만든다.
- Catalog retrieval alias에 product health 지표를 추가해 여러 CatalogMetadata 중 product risk 질문이 `dataset_product_health_gold`를 선택할 수 있게 한다.
- 예측/매출/감성분석처럼 현재 CatalogMetadata로 답할 수 없는 질문은 `unsupported_question` guardrail로 차단한다.
- focused tests로 intent 분류, CatalogMetadata 기반 SQL 생성, product health catalog selection, unsupported 차단을 검증한다.

## 범위 제외

- 범용 NL2SQL.
- LLM 기반 질문 해석.
- Catalog RAG index, retrieval trace public contract, hybrid query.
- M1 UI 변경.
- M5 Catalog 저장/수정 책임 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md` Week 2 SQL execution adapter boundary
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/workflows/feature/m6-duckdb-runtime-integration/report.md`
- PR #204 `feature/m6-duckdb-runtime-integration`
- `origin/main` `e15300a` product risk representative path update
- `origin/main` `e1ddef2` M2 product health runtime smoke seed input update

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

- not needed. 이번 Phase는 한 의미 단위인 `M6 SQL planner intent rules`만 다룬다.

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

- [x] `SqlPlanner`가 리뷰 수 질문을 `top_count` SQL로 만든다.
- [x] `SqlPlanner`가 평점 질문을 `top_rating` SQL로 만든다.
- [x] `SqlPlanner`가 product health 위험 점수 질문을 `top_risk` SQL로 만든다.
- [x] `SqlPlanner`가 product health 부정 리뷰율 질문을 `top_negative_review` SQL로 만든다.
- [x] `SqlPlanner`가 product health 낮은 전환율 질문을 `low_conversion` SQL로 만든다.
- [x] `SqlPlanner`가 product health 배송 지연율 질문을 `top_late_delivery` SQL로 만든다.
- [x] Catalog retrieval alias가 product risk 질문을 `dataset_product_health_gold` 쪽으로 선택한다.
- [x] SQL은 CatalogMetadata context의 table/allowed columns/default limit만 사용한다.
- [x] 지원하지 않는 질문은 SQL engine 호출 없이 `blocked/unsupported_question`으로 반환된다.
- [x] 기존 DuckDB-backed M6 query tests가 통과한다.
- [x] Acceptance, Regression/failure scenario, Manual verification 결과가 `quality.md`와 `report.md`에 기록된다.
