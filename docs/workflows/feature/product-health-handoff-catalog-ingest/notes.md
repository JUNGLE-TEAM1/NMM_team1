# Product Health handoff catalog ingest notes

- 사용자 우려: 현재 handoff 자료를 그대로 넣으면 AI Query와 rulebase가 깨질 가능성이 크다.
- 분석 결과 handoff Gold는 `internal_product_id`, `product_title`, `avg_rating` 등 30컬럼이고, 현재 frozen contract는 `product_id`, `product_name`, `average_rating` 등 canonical 20컬럼을 기대한다.
- 해결 방향은 rulebase를 handoff-native 컬럼으로 흔드는 것이 아니라, handoff를 canonical Gold와 Week 2 `CatalogMetadata`로 import하는 것이다.
- `silver/*.parquet`은 내부 lineage/evidence로 유지한다. 기본 사용자-facing query dataset은 `dataset_product_health_gold` 하나다.
- 실제 import smoke 결과 canonical Gold는 1,000행, Gold bytes는 98,642, processed input bytes는 5,668,612,855다.
