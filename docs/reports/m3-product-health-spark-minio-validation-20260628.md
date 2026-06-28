# M3 product_health Gold Spark/MinIO 검증 보고서

- Type: M3 contract validation
- Date: 2026-06-28
- Scope: `gold_product_health` schema, risk score policy, zero denominator rule, unknown source partial-output behavior, Spark/MinIO handoff feasibility
- Local validation output root: `F:\ai\m3-product-health-spark-minio-validation`
- MinIO output root: `s3a://m3-gold/product_health_validation/`

## 1. 결론

M3 필수 TODO 중 M3가 책임지는 계약/추천/검증 산출물은 현재 닫을 수 있다.

`gold_product_health` 최소 schema는 고정됐다. 출력 컬럼은 `product_id`, `product_name`, `category_l1`, `review_count`, `average_rating`, `negative_review_rate`, `view_count`, `purchase_count`, `conversion_rate`, `delivery_count`, `late_delivery_rate`, `risk_score` 순서로 유지된다. M1/M6는 이 컬럼명을 기준으로 UI와 SQL context를 만들 수 있다.

`risk_score`는 컬럼명과 0~100 범위만 고정하고, 계산식은 source evidence 기반 policy로 추천/승인하도록 유지했다. local validation harness는 deterministic fallback으로 `negative_review_rate`, `low_rating_score`, `low_conversion_score`, `late_delivery_rate`를 available component만 재정규화해 계산한다. 단 `low_conversion_score = 1 - conversion_rate`는 검증 fallback이지 모든 운영 데이터에 적용할 전역 공식이 아니다. 이 점을 `contracts/product_health_risk_score_policy.sample.json`에 명시했다.

zero denominator 규칙은 `null`로 고정했다. `view_count=0`이면 `conversion_rate=null`, `delivery_count=0`이면 `late_delivery_rate=null`, `review_count=0`이면 `negative_review_rate=null`, 사용 가능한 risk component가 하나도 없으면 `risk_score=null`이다. 0으로 채우면 “근거 없음”과 “위험 없음”이 섞이므로 쓰지 않는다.

PR 보강 과정에서 reference runner의 증거 출력도 강화했다. 이제 `product_health_reference_summary.json`은 `source_level_evidence`, `input_total_bytes`, `input_total_rows_scanned`, `full_product_universe_count`, `output_truncated`, `truncated_product_count`, `cross_source_identity_guard`를 포함한다. 따라서 Gold output이 raw input보다 작아졌을 때 이것이 상품 단위 집계 때문인지, `product_id` 유실이나 debug cap 때문인지 구분할 수 있다.

`tools/product_health_reference_transform.py`의 기본 `--output-limit`도 `100000` cap에서 `0` no cap으로 바꿨다. debug cap을 명시적으로 주면 output은 제한되지만 summary에 `output_truncated=true`가 남는다. 이 보강은 "100GB를 넣었는데 Gold가 작다"는 사실만으로 성공/실패를 판단하지 않고, 축소 이유를 증거로 설명하기 위한 장치다.

## 2. 구현 및 계약 변경

### 2.1 ProductHealth reference runner

`tools/product_health_reference_transform.py`를 추가했다. 이 파일은 운영 Spark runtime이 아니라 M3 계약의 local deterministic smoke runner다.

주요 역할:

- JSONL/JSON/CSV input을 받아 fixed `gold_product_health` schema를 생성한다.
- source-level aggregate 후 product_id universe를 만든다.
- product master가 없어도 review/behavior/delivery aggregate에 product_id가 있으면 행을 버리지 않는다.
- zero denominator를 `null`로 만든다.
- risk component가 있는 경우에만 weight를 재정규화해 `risk_score`를 계산한다.
- `risk_score_coverage.jsonl`로 어떤 component가 쓰였는지 남긴다.

중요 보정:

- Amazon review의 `title`은 상품명이 아니라 리뷰 제목일 수 있으므로 review source에서는 `title`을 `product_name`으로 쓰지 않는다.
- product master에서는 `title`을 product name 후보로 쓸 수 있다.
- behavior source에서는 `item.title`, `item.category_id` 같은 nested hint만 dimension 보강에 쓴다.

### 2.2 Spark/MinIO validation harness

`tools/product_health_spark_validation.py`를 추가했다. 이 파일은 M3 core runtime이 아니라 M2 Spark boundary 검증용 harness다.

주요 역할:

- Docker Spark master/worker에서 실행한다.
- MinIO `m3-raw`에서 bounded source window를 읽는다.
- M3 transform semantics와 같은 순서로 `source aggregate -> product_id universe -> join -> metric derive -> gold output`을 수행한다.
- MinIO `m3-gold`에 JSON/Parquet validation output을 쓴다.
- F 드라이브에 summary JSON을 남긴다.

계약 반영:

- `contracts/product_health_transform_spec.sample.json`에 `reference_runner`와 `spark_minio_validation_harness`를 추가했다.
- `contracts/product_health_gold_contract.sample.json`에는 product master 부재 때문에 signal row를 버리지 말라는 anti-pattern을 추가했다.
- `contracts/product_health_workflow_definition.sample.json`에는 `full_outer_product_id_union_with_product_master_preferred_dimensions` join strategy를 명시했다.

## 3. Spark/MinIO 실행 결과

### 3.1 Controlled full seed

목적: 작은 데이터에서 product-health Gold가 완성되는지 확인한다.

실행:

- Spark app: `m3-product-health-controlled-seed-docker`
- Spark application id: `app-20260628080320-0059`
- Output: `s3a://m3-gold/product_health_validation/docker_controlled_seed_20260628_v2/case=controlled_full_seed`
- Summary: `F:\ai\m3-product-health-spark-minio-validation\docker_controlled_seed_20260628_v2\summary.json`

수치:

| 항목 | 값 |
| --- | ---: |
| row_count | 3 |
| average_rating non-null | 2 |
| negative_review_rate non-null | 2 |
| conversion_rate non-null | 1 |
| late_delivery_rate non-null | 2 |
| risk_score non-null | 2 |
| view_count=0 and conversion_rate=null | 2 |
| delivery_count=0 and late_delivery_rate=null | 1 |
| review_count=0 and negative_review_rate=null | 1 |
| duration_seconds | 148.573 |

해석:

- 발표 최소 완료 기준인 “작은 데이터로 `gold_product_health` 생성”은 충족한다.
- `S1`은 review/behavior/delivery가 모두 있어 `risk_score=50.0`으로 계산됐다.
- `S2`는 purchase는 있지만 view denominator가 없어 `conversion_rate=null`이 됐다. 대신 review와 delivery component만으로 `risk_score=9.38`이 계산됐다.
- `S3`은 product master만 있고 signal이 없어 metric은 0/null이고 `risk_score=null`이다. 이것이 맞다. 없는 signal을 0점 위험으로 만들면 안 된다.

### 3.2 Amazon review + metadata bounded window

목적: 실제 F 데이터의 Amazon review/metadata window에서 review 중심 partial Gold가 생성되는지 확인한다.

Input window:

- `s3a://m3-raw/product_health_validation/windows/amazon_reviews_range_sample.jsonl`
- `s3a://m3-raw/product_health_validation/windows/amazon_metadata_range_sample.jsonl`
- Local source: `F:\ai\m3-l0-l6-spark-contract-run\...\range_sample_input.jsonl`
- Uploaded bytes: reviews `125,273,975`, metadata `628,262,268`

실행:

- Spark app: `m3-product-health-amazon-range-window`
- Spark application id: `app-20260628084223-0062`
- Output: `s3a://m3-gold/product_health_validation/run_20260628_amazon_range_window/case=amazon_review_metadata`
- Summary: `F:\ai\m3-product-health-spark-minio-validation\run_20260628_amazon_range_window\summary.json`

수치:

| 항목 | 값 |
| --- | ---: |
| row_count | 403,311 |
| average_rating non-null | 162,094 |
| negative_review_rate non-null | 162,094 |
| conversion_rate non-null | 0 |
| late_delivery_rate non-null | 0 |
| risk_score non-null | 162,094 |
| view_count=0 and conversion_rate=null | 403,311 |
| delivery_count=0 and late_delivery_rate=null | 403,311 |
| review_count=0 and negative_review_rate=null | 241,217 |
| duration_seconds | 181.479 |
| MinIO output size | 352 MB |

해석:

- Amazon review/metadata에는 behavior denominator와 delivery fact가 없다. 따라서 `conversion_rate`와 `late_delivery_rate`가 0개 non-null인 것이 정상이다.
- review가 있는 162,094개 product_id에 대해서만 review 기반 `risk_score`가 계산됐다.
- product master에만 있거나 review가 없는 241,217개 product_id는 `review_count=0`, `negative_review_rate=null`, `risk_score=null` 또는 다른 component 부재 상태로 남는다.
- 일부 product는 metadata에서 `product_name`, `category_l1`이 보강되고, 일부는 null로 남는다. null은 실패가 아니라 source evidence 부재 표현이다.
- 이 결과는 “M3가 없는 metric을 invent하지 않는다”는 요구를 충족한다.

### 3.3 Taobao behavior bounded window

목적: 실제 F 데이터의 nested behavior JSONL에서 behavior-only partial Gold가 생성되는지 확인한다.

Input window:

- `s3a://m3-raw/product_health_validation/windows/taobao_behavior_range_sample.jsonl`
- Local source: `F:\ai\m3-l0-l6-spark-contract-run\...\taobao_user_events_jsonl\l1\range_sample_input.jsonl`
- Uploaded bytes: `293,394,164`

실행:

- Spark app: `m3-product-health-taobao-range-window`
- Spark application id: `app-20260628084612-0063`
- Output: `s3a://m3-gold/product_health_validation/run_20260628_taobao_range_window/case=taobao_behavior_only`
- Summary: `F:\ai\m3-product-health-spark-minio-validation\run_20260628_taobao_range_window\summary.json`

수치:

| 항목 | 값 |
| --- | ---: |
| row_count | 171,469 |
| average_rating non-null | 0 |
| negative_review_rate non-null | 0 |
| conversion_rate non-null | 150,483 |
| late_delivery_rate non-null | 0 |
| risk_score non-null | 150,483 |
| view_count=0 and conversion_rate=null | 20,986 |
| delivery_count=0 and late_delivery_rate=null | 171,469 |
| review_count=0 and negative_review_rate=null | 171,469 |
| duration_seconds | 193.086 |
| MinIO output size | 163 MB |

해석:

- Taobao behavior에는 review와 delivery fact가 없으므로 `average_rating`, `negative_review_rate`, `late_delivery_rate`가 전부 null인 것이 정상이다.
- nested `item.item_id`를 `product_id`로, `item.category_id`를 `category_l1` hint로 사용할 수 있었다.
- view denominator가 있는 150,483개 product_id에서만 `conversion_rate`가 계산됐다.
- `view_count=0`인 20,986개 product_id는 `conversion_rate=null`이다. purchase/click만 있고 view denominator가 없는 경우를 0% conversion으로 단정하지 않는다.
- behavior-only `risk_score`는 local fallback에서 conversion component만으로 계산됐다. 운영 공식으로 확정하려면 L9 owner approval 또는 baseline policy가 필요하다.

### 3.4 PR hardening reference smoke

목적: 실제 F 드라이브 bounded window를 사용해 reference runner가 source-level evidence와 truncation/identity guard를 남기는지 확인한다.

Input:

- Reviews: `F:\ai\m3-l0-l6-spark-contract-run\run_20260627_m3_quality_handoff_100gb_cluster\amazon_clothing_reviews_jsonl\l1\range_sample_input.jsonl`
- Product master: `F:\ai\m3-l0-l6-spark-contract-run\run_20260627_m3_quality_handoff_100gb_cluster\amazon_clothing_metadata_jsonl\l1\range_sample_input.jsonl`
- Behavior: `F:\ai\m3-l0-l6-spark-contract-run\run_20260627_m3_quality_handoff_100gb_cluster\taobao_user_events_jsonl\l1\range_sample_input.jsonl`
- Output: `F:\ai\m3-product-health-reference-validation\run_20260628_pr_evidence_smoke_guarded`

수치:

| 항목 | 값 |
| --- | ---: |
| input_total_bytes | 955,514,539 |
| input_total_rows_scanned | 150,000 |
| full_product_universe_count | 133,646 |
| row_count | 133,646 |
| output_truncated | false |
| truncated_product_count | 0 |
| average_rating non-null | 42,484 |
| negative_review_rate non-null | 42,484 |
| conversion_rate non-null | 37,278 |
| late_delivery_rate non-null | 0 |
| risk_score non-null | 79,762 |

해석:

- Gold row count가 input row count보다 작지만, 이는 `product_id` grain 집계 때문이다. `output_truncated=false`와 `full_product_universe_count=row_count`가 이를 확인한다.
- delivery source를 넣지 않았기 때문에 `late_delivery_rate`가 전부 null인 것은 정상이다. 없는 delivery fact를 review text로 추측하지 않는다.
- Amazon과 Taobao를 함께 넣은 smoke는 heterogeneous source handling 검증용이다. 같은 business product identity가 승인된 것은 아니므로 `cross_source_identity_guard.identity_mapping_approved=false`, `catalog_ready_claim=false`로 남긴다.
- 이 결과는 M3 reference validation evidence이며, M5 catalog ready 또는 production Gold 완료 주장이 아니다.

## 4. 실패/비용 검증

### 4.1 Full raw Amazon direct scan

무제한 raw MinIO path를 그대로 읽는 Spark job도 실행했다.

- Spark app: `m3-product-health-amazon-review-metadata-full`
- Application id: `app-20260628080812-0060`
- 상태: 21분 이상 output 생성 전 scan/aggregate 단계에 머물러 수동 중단
- MinIO output: 생성 전

100,000 limit을 준 raw path job도 실행했다.

- Spark app: `m3-product-health-amazon-review-metadata-100k`
- Application id: `app-20260628083031-0061`
- 상태: 10분 이상 output 생성 전 단계에 머물러 수동 중단

해석:

- Spark 자체가 불가능한 것이 아니다. 같은 Spark/MinIO cluster는 controlled seed, Amazon bounded window, Taobao bounded window를 성공시켰다.
- 병목은 full raw JSONL object를 추천/검증 경로에서 직접 읽는 방식이다.
- M3의 AI-assisted recommendation 단계는 data-plane 전체 스캔이 아니라 L0-L2에서 만들어진 bounded source window/profile/schema snapshot을 입력으로 삼아야 한다.
- 전체 materialization, 5GB+ evidence, production write는 M2 Spark job으로 넘기는 것이 맞다.

## 5. M3 필수 TODO 상태

| TODO | 상태 | 근거 |
| --- | --- | --- |
| `gold_product_health` 최소 schema 확정 | 완료 | `contracts/product_health_gold_contract.sample.json`, tests |
| 최소 컬럼 고정 | 완료 | `tests/test_product_health_contracts.py` |
| `risk_score` 계산식 확정 | 조건부 완료 | policy contract로 확정. 단 전역 상수가 아니라 source-adaptive policy + L9 approval |
| zero denominator 규칙 확정 | 완료 | null policy, Spark summaries |
| small transform 구현 | 완료 | `tools/product_health_reference_transform.py`, controlled seed Spark |
| 5GB run에서도 같은 transform이 돌도록 M2에 넘길 spec/job logic 제공 | M3 측 완료 | `contracts/product_health_transform_spec.sample.json`, `tools/product_health_spark_validation.py`; 실제 5GB production execution은 M2 |
| 작은 데이터로 Gold 생성 | 완료 | controlled seed row_count 3 |
| risk_score와 근거 지표 계산 | 완료 | controlled seed, Amazon, Taobao summaries |
| M6/M1이 해석할 수 있는 컬럼명 고정 | 완료 | schema/catalog/vector handoff fixtures |

## 6. M6/M1/M5/DAG handoff 판정

M6 관점:

- `product_health_catalog_metadata.sample.json`와 `product_health_vector_index_handoff.sample.json`가 dataset/table/metric 문서를 제공한다.
- fixed column names가 있어 자연어 질의가 `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate`로 매핑될 수 있다.
- 단 Gold readiness가 approved가 아니면 M6는 trusted metric으로 노출하면 안 된다.

M1 관점:

- `product_id`, `product_name`, `category_l1`, 핵심 metric 이름이 고정되어 카드/테이블 UI를 만들 수 있다.
- null metric은 “데이터 없음”으로 표시해야지 0으로 표시하면 안 된다.

M5 관점:

- Spark output URI와 summary JSON을 workflow/catalag evidence로 저장할 수 있다.
- `spark_minio_validation_harness`는 validation only다. 운영 runner 선택과 catalog persistence는 M5/M2 책임이다.

DAG 관점:

- `product_health_workflow_definition.sample.json`이 `source -> normalize -> aggregate -> join_and_score -> load` 순서를 제공한다.
- join은 raw fact join이 아니라 source aggregate 후 product_id universe join이다. 이 규칙이 없으면 review x behavior x delivery row multiplication이 생긴다.

## 7. 오버피팅 방지 판정

이번 검증에서 일부러 Amazon과 Taobao를 하나의 Gold로 합치지 않았다. 두 source 모두 상품 id처럼 보이는 필드가 있지만 같은 business product_id라는 근거가 없다. M3는 source group 또는 identity mapping이 승인되지 않은 상태에서 교차 source join을 추천하면 안 된다.

Taxi 데이터는 product-health source가 아니다. 현재 `F:\ai\nyc-taxi-data-20gb` 경로는 존재하지 않았다. 따라서 taxi를 product health 성공 케이스로 쓰지 않았다. taxi가 들어오면 L3/L4는 product-health Gold가 아니라 trip/time/location fare 계열 Gold 후보를 추천하거나 product-health는 `not_applicable`로 내려야 한다.

## 8. 남은 한계

- Spark direct full raw JSONL scan은 검증 중 너무 느렸다. 이건 M3 구현 결함이라기보다 M3 추천 단계에 full data-plane scan을 넣으면 안 된다는 근거다.
- `low_conversion_score = 1 - conversion_rate`는 local validation fallback이다. 운영에는 category/global baseline 또는 사용자가 승인한 policy가 필요하다.
- 실제 5GB+ production materialization evidence는 M2가 같은 transform spec을 Spark job으로 실행해서 닫아야 한다.
- 따라서 5GB+ production materialization evidence는 M2 책임이고, M3는 그 실행이 같은 contract/spec을 따를 수 있도록 schema, metric, policy, DAG intent, validation harness를 제공한다.
- M6가 실제 SQL로 query하는 통합 smoke는 M6/M5 연결 후 별도 검증이 필요하다. M3는 schema/catalog/query context handoff까지 제공한다.

## 9. 검증 명령

```powershell
python -m py_compile tools\product_health_reference_transform.py tools\product_health_spark_validation.py
python -m pytest tests\test_product_health_contracts.py tests\test_product_health_reference_transform.py tests\test_m3_expanded_contract.py -q

docker cp tools\product_health_spark_validation.py m3-spark-master:/tmp/product_health_spark_validation.py

docker exec -e M3_MINIO_ACCESS_KEY -e M3_MINIO_SECRET_KEY m3-spark-master sh -lc "/opt/spark/bin/spark-submit --master spark://m3-spark-master:7077 /tmp/product_health_spark_validation.py --case controlled_full_seed --master spark://m3-spark-master:7077 --app-name m3-product-health-controlled-seed-docker --s3-endpoint http://m3-minio:9000 --cores-max 4 --executor-instances 2 --executor-cores 2 --shuffle-partitions 4 --output-uri s3a://m3-gold/product_health_validation/docker_controlled_seed_20260628_v2 --summary-path /tmp/product_health_controlled_seed_summary.json"

docker exec -e M3_MINIO_ACCESS_KEY -e M3_MINIO_SECRET_KEY m3-spark-master sh -lc "/opt/spark/bin/spark-submit --master spark://m3-spark-master:7077 /tmp/product_health_spark_validation.py --case amazon_review_metadata --master spark://m3-spark-master:7077 --app-name m3-product-health-amazon-range-window --s3-endpoint http://m3-minio:9000 --cores-max 6 --executor-instances 3 --executor-cores 2 --executor-memory 2g --shuffle-partitions 18 --source-limit 0 --amazon-reviews-uri s3a://m3-raw/product_health_validation/windows/amazon_reviews_range_sample.jsonl --amazon-metadata-uri s3a://m3-raw/product_health_validation/windows/amazon_metadata_range_sample.jsonl --output-uri s3a://m3-gold/product_health_validation/run_20260628_amazon_range_window --summary-path /tmp/product_health_amazon_range_summary.json"

docker exec -e M3_MINIO_ACCESS_KEY -e M3_MINIO_SECRET_KEY m3-spark-master sh -lc "/opt/spark/bin/spark-submit --master spark://m3-spark-master:7077 /tmp/product_health_spark_validation.py --case taobao_behavior_only --master spark://m3-spark-master:7077 --app-name m3-product-health-taobao-range-window --s3-endpoint http://m3-minio:9000 --cores-max 6 --executor-instances 3 --executor-cores 2 --executor-memory 2g --shuffle-partitions 18 --source-limit 0 --taobao-behavior-uri s3a://m3-raw/product_health_validation/windows/taobao_behavior_range_sample.jsonl --output-uri s3a://m3-gold/product_health_validation/run_20260628_taobao_range_window --summary-path /tmp/product_health_taobao_range_summary.json"
```
