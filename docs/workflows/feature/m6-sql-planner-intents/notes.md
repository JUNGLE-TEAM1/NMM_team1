# M6 SQL planner intent rules 노트

## 진행 메모

- 2026-06-27: M6 Step 4로 `SqlPlanner`를 추가해 SQL 생성 intent를 `top_count`, `top_rating`, `unsupported`로 분리했다.
- `Week2AIQueryService`는 planner가 만든 SQL만 `SqlEngineAdapter`로 실행한다.
- `unsupported` 질문은 SQL engine을 호출하지 않고 `blocked/unsupported_question`으로 반환한다.
- 2026-06-28: `origin/main` `e15300a` 기준 Week2 대표 path가 `gold_product_health`로 갱신된 것을 확인했다. Step 4를 리뷰 전용 planner가 아니라 Catalog-aware planner로 수정하고 `top_risk`, `top_negative_review`, `low_conversion`, `top_late_delivery` intent를 추가했다.
- 2026-06-28: PR #228 merge 이후 `origin/main` `e1ddef2` 기준 M2 product health runtime smoke seed inputs가 추가된 것을 확인했다. M6 Step 4 범위는 final Gold CatalogMetadata fixture 생성이 아니라 CatalogMetadata가 제공될 때 planner가 product health SQL을 만들 수 있게 하는 것이다.

## 결정

- 범용 NL2SQL은 하지 않는다. CatalogMetadata가 가진 `allowed_columns` 안에서만 deterministic rules를 구현한다.
- 기존 reviews demo의 `product_id`, `review_count`, `average_rating` 규칙은 regression으로 유지한다.
- 최신 대표 path의 `gold_product_health` 지표인 `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate` 규칙을 Step 4에 포함한다.
- `default_limit`은 CatalogMetadata context를 사용하되, planner의 display limit은 최대 10으로 제한한다.

## 열린 질문

- PR #204 merge 이후 이 branch를 `origin/main` `e15300a` 위로 rebase했고, PR #228 merge 이후 다시 `origin/main` `e1ddef2` 위로 rebase했다.
- `contracts/catalog_metadata.sample.json`은 아직 `dataset_reviews_gold` 예시를 유지한다. `dataset_product_health_gold` CatalogMetadata/Gold output fixture 추가는 별도 contract/data slice에서 다루는 것이 안전하다.

## 링크 / 증거

- Dependency: PR #204 `feature/m6-duckdb-runtime-integration`
- Issue: #205
- Latest main context: `origin/main` `e1ddef2` includes product risk representative path docs and M2 product health runtime smoke seed inputs.
- Focused test after product health update: `backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query.py` -> 21 passed.
