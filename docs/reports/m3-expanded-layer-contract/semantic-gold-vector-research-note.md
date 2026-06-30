# M3 Semantic Gold / VectorDB 보강 리서치 노트

## 결론

schema/profile/catalog metadata를 vectorDB에 넣는 방향은 타당하다. 단, 정확히는 Gold 값 계산 정확도를 직접 올리는 것이 아니라 unknown source에서 어떤 Gold 후보와 field-role matching을 선택할지의 정확도를 올린다.

따라서 M3 core에서는 raw row를 embedding하지 않는다. L2 profile, L3 field role hints, schema/profile document, metric definition, Gold template, catalog metadata 같은 control-plane metadata만 vector index 대상으로 둔다.

## 근거 자료

| Source | Relevant point | M3 반영 |
| --- | --- | --- |
| OpenMetadata Semantic Search | metadata catalog에 vector embeddings를 붙여 natural language query로 metadata asset을 찾는 구조를 설명한다. | raw data가 아니라 catalog/schema/metric/template metadata를 index 대상으로 제한했다. |
| Databricks Medallion Architecture | Gold는 business-ready, curated, aggregated layer다. | `gold_product_health`를 raw review 출력이 아니라 business metric table contract로 고정했다. |
| dbt MetricFlow / Semantic Layer | metric은 중앙 정의와 semantic model을 기반으로 여러 도구가 같은 숫자를 쓰게 한다. | metric formula, denominator rule, grain, output schema를 M3 contract로 freeze했다. |
| Qdrant filtering / indexing | vector search는 payload filter와 같이 써야 precise retrieval이 된다. | vector handoff에 `payload_filter_keys`와 `first_filter -> vector_search` 정책을 넣었다. |

## 구현 반영

이번 구현은 L3 내부를 다음처럼 세분화한다.

```text
L3A metadata_retrieval_index_plan
-> L3B gold_template_candidate_retrieval
-> L3C candidate_grounding_report
-> L4 product_health_gold_template_draft
```

L3A는 vectorDB에 넣을 schema/profile/column/gold-template document와 payload filter를 만든다. L3B는 `gold_product_health_v1` 같은 Gold template 후보를 검색 또는 deterministic fallback으로 찾는다. L3C는 similarity 결과를 그대로 믿지 않고 exact type/name, denominator, join overlap, PII/query exposure, preview, approval 조건을 확인한다.

## Gold 생성 기준

`gold_product_health`는 다음 순서로 만들어야 한다.

```text
bronze_preserve
-> silver_normalize_each_source
-> source_level_aggregate
-> product_join
-> metric_derivation
-> gold_product_health
```

raw fact를 먼저 join하면 review row와 behavior/delivery row가 곱해져 count와 rate가 틀어진다. 그래서 reviews, behavior events, delivery facts를 각각 `product_id` grain으로 먼저 aggregate한 뒤 product master와 join한다.

## Metric rule

Zero denominator는 `0`이 아니라 `null`이다.

```text
review_count = 0    -> negative_review_rate = null
view_count = 0      -> conversion_rate = null
delivery_count = 0  -> late_delivery_rate = null
```

`risk_score`는 출력 컬럼명과 0~100 범위만 Gold schema에서 고정한다. 계산식, component, weight는 전역 상수로 고정하지 않는다. L4가 L3 field evidence와 retrieval/grounding 결과를 보고 `risk_score_policy_recommendation_draft.json`을 만들고, L5에서 사용자가 승인하거나 수정한 policy만 L6/M2 deterministic execution으로 넘어간다.

정책 추천의 기본 후보 component는 다음과 같다. 아래 숫자는 실제 운영 고정값이 아니라 AI 추천과 local deterministic fallback이 참고하는 prior hint다.

```text
negative_review_rate  prior hint 0.35
low_rating_score      prior hint 0.30
low_conversion_score  prior hint 0.20
late_delivery_rate    prior hint 0.15
```

source에 behavior denominator가 없으면 `low_conversion_score`를 제외하거나 `needs_source_evidence`로 둔다. delivery lateness evidence가 없으면 `late_delivery_rate` component를 제외한다. 없는 component를 0으로 치지 않고, 승인된 policy 안에서 존재하는 component만 재정규화한다. 이 때문에 `risk_score_coverage` internal metadata가 필요하다.

즉 `review-only` 데이터의 `risk_score`와 `review+behavior+delivery` 데이터의 `risk_score`는 같은 출력 컬럼을 쓰더라도 coverage와 승인 policy가 다르다. M6/M1에는 score만 보여주지 말고, 내부 catalog에는 어떤 component로 산출됐는지 남겨야 한다.

## 100GB 데이터 역할

100GB local corpus는 정확성, 속도, 실제 생성 가능성 stress validation용이다. 발표 live path나 demo dataset으로 쓰지 않는다. 발표는 `pipeline_product_health_e2e -> dataset_product_health_gold -> gold_product_health -> M6 DuckDB query -> M1 display` 한 줄을 고정 run evidence로 보여주는 것이 맞다.

## Sources

- OpenMetadata Semantic Search: https://docs.open-metadata.org/v1.12.x/deployment/semantic-search
- Databricks Medallion Architecture: https://learn.microsoft.com/en-us/azure/databricks/lakehouse/medallion
- dbt MetricFlow: https://docs.getdbt.com/docs/build/about-metricflow
- Qdrant filtering: https://qdrant.tech/documentation/search/filtering/
- Qdrant payload indexing: https://qdrant.tech/documentation/manage-data/payload/
