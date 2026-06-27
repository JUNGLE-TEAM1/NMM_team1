# Week2 상품 리스크 Source of Truth 전파 보고서

## Short Report / 짧은 보고

- Type: docs / Source of Truth propagation
- Date: 2026-06-27
- Changed: Week2 대표 경로를 Amazon Reviews 단독 분석에서 `5GB raw/bronze input -> gold_product_health -> M5 Catalog -> M6 SQL/AI Query -> M1 UI`로 갱신했다. PM 확장안 문서와 ver2 핵심 문서, interface, acceptance, regression, manual verification을 같은 기준으로 맞췄다.
- Verified: `git diff --check`; conflict scan with `rg -n "분석 대표 경로는 Amazon|Amazon Reviews JSON 중심|Amazon Reviews CatalogMetadata|synthetic companion|후속 리서치|pipeline_reviews_json_e2e|dataset_reviews_gold|gold_taxi_daily_metrics|Taxi 별도 evidence" ...`.
- Remaining: 구현은 아직 따라오지 않았다. `gold_product_health` TransformSpec, 5GB input preparation/run evidence, M5 Catalog integration, M6 SQL allowlist/query, M1 product risk UI는 후속 PR에서 닫아야 한다.
- Next context: 다음 구현은 Phase 1 small `gold_product_health` smoke와 5GB fact input preparation/run evidence를 분리하되, 5GB evidence는 반드시 `dataset_product_health_gold` lineage에 연결한다.
- Risk: 기존 M5 Airflow reviews smoke와 Taxi local batch evidence는 legacy/supporting path로 남아 있다. 이를 새 대표 경로 완료로 오해하면 안 된다.
