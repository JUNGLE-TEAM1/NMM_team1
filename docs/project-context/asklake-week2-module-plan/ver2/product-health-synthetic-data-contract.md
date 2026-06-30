# Product Health 합성데이터 생성 계약

## 목적

이 문서는 `Product Health` 합성데이터 생성을 별도 작업으로 분리할 때 사용할 구현 계약이다.

상위 설계와 발표 맥락은 [`product-health-demo-data-design.md`](product-health-demo-data-design.md)를 따른다. 이 문서는 작업자가 바로 구현할 수 있도록 입력 파일, 출력 파일, schema, metric 계산식, 검증 기준, 모듈 handoff를 고정한다.

## 작업 범위

이번 작업은 공개 원천 데이터와 로컬 Taxi sample을 사용해 AskLake Week2 대표 Gold dataset인 `gold_product_health`를 생성한다.

| 구분 | 포함 |
| --- | --- |
| Source discovery | 로컬 원본 파일 존재 여부, 크기, sample row 확인 |
| Bronze staging | 원본별 최소 read 가능 상태 확인과 source evidence 생성 |
| Silver normalization | behavior, review, product catalog, delivery fact를 표준 schema로 변환 |
| Seed mapping | 원천 간 실제 공통 키가 없음을 명시하고 `internal_product_id` 기준 mapping 생성 |
| Gold aggregation | `gold_product_health.parquet` 생성 |
| Handoff artifact | M5 Catalog, M6 SQL, M1 표시가 읽을 수 있는 metadata JSON 생성 |

## 제외 범위

- MEP 이미지 파일 전체 다운로드
- MEP 이미지 모델 inference
- Kafka streaming ingestion
- 외부 LLM 호출
- Airflow 운영 DAG 완성
- 50GB runtime hardening
- 실제 쇼핑몰 데이터라고 주장하는 표현
- 원천 간 실제 product/order/user key가 있다고 주장하는 표현

## Canonical 이름

Week2 대표 Gold dataset의 canonical 이름은 `gold_product_health`다.

| 항목 | 값 |
| --- | --- |
| Dataset id | `dataset_product_health_gold` |
| Pipeline id | `pipeline_product_health_e2e` |
| Gold table name | `gold_product_health` |
| Gold file | `gold/gold_product_health.parquet` |
| 이전 설계서 alias | `gold_product_ops_health` |

`gold_product_ops_health`는 의미를 설명하기 위한 이전 alias로만 취급한다. 새 구현과 catalog metadata에는 `gold_product_health`를 사용한다.

## 로컬 입력 계약

기본 root는 repo의 `.gitignore`된 `data/` 아래다.

```text
data/local_sources/product_health/
  raw/
    amazon_reviews_2023/
    kaggle_ecommerce_behavior/
    mep_3m/
    taxi_existing/
  bronze/
  silver/
  gold/
  catalog/
  evidence/
```

현재 준비된 입력 파일 기준은 다음이다.

| Source role | 기본 파일 | 필수 여부 | 비고 |
| --- | --- | --- | --- |
| behavior | `raw/kaggle_ecommerce_behavior/2019-Oct.csv` | 필수 | symlink 허용 |
| behavior | `raw/kaggle_ecommerce_behavior/2019-Nov.csv` | 선택 | 5GB evidence 확장 시 포함 |
| review | `raw/amazon_reviews_2023/raw/review_categories/All_Beauty.jsonl` | 필수 | Amazon Reviews 2023 subset |
| review metadata | `raw/amazon_reviews_2023/raw/meta_categories/meta_All_Beauty.jsonl` | 필수 | product metadata 보조 |
| product catalog | `raw/mep_3m/annotations-1k.json` | 필수 smoke | 빠른 개발용 |
| product catalog | `raw/mep_3m/annotations.json` | 선택 full | 대용량 evidence 후보 |
| product category | `raw/mep_3m/dataset_info.xlsx` | 선택 | category label 확인용 |
| delivery | `raw/taxi_existing/*` | 필수 before 5GB run | 로컬 보유 Taxi data를 연결 |

Taxi 파일이 아직 `raw/taxi_existing/`에 없으면 smoke는 delivery synthetic fallback을 사용할 수 있다. 단, 5GB evidence run은 실제 Taxi local file 또는 동등한 5GB 이상 raw/bronze input을 사용해야 한다.

## Sampling 계약

작업자는 같은 입력에서 같은 결과가 나오도록 고정 seed를 사용한다.

| 항목 | 값 |
| --- | --- |
| Random seed | `20260630` |
| Smoke target products | 1,000 |
| Smoke behavior rows | 최대 500,000 |
| Smoke review rows | 최대 100,000 |
| Smoke delivery rows | 최대 100,000 |
| 5GB evidence 기준 | source별 input bytes 합산 `>= 5GB` |

Smoke run은 빠른 UI/API 연동용이다. 5GB evidence run은 같은 transform과 schema를 사용하되 입력 범위만 확장한다.

## 출력 계약

합성데이터 생성 작업은 아래 파일을 만든다.

| Output | 경로 | 포맷 | 소비자 |
| --- | --- | --- | --- |
| behavior silver | `silver/silver_user_events.parquet` | Parquet | M3/M5 |
| review silver | `silver/silver_product_reviews.parquet` | Parquet | M3/M5 |
| catalog silver | `silver/silver_product_catalog.parquet` | Parquet | M3/M5/M6 |
| delivery silver | `silver/silver_delivery_trip_logs.parquet` | Parquet | M3/M5 |
| seed mapping | `silver/seed_product_mapping.parquet` | Parquet | M3/M5/M6/M1 evidence |
| Gold dataset | `gold/gold_product_health.parquet` | Parquet | M5/M6/M1 |
| Source handoff | `catalog/product_health_source_handoff.json` | JSON | M1/M3/M5 |
| Catalog handoff | `catalog/dataset_product_health_gold.json` | JSON | M5/M6 |
| Smoke run evidence | `evidence/product_health_run_summary.json` | JSON | M1/M5/manual verification |
| 5GB run evidence | `evidence/product_health_5gb_run_summary.json` | JSON | M1/M5/manual verification |

Parquet compression은 가능하면 `snappy`를 사용한다. local engine이 `snappy`를 지원하지 않으면 `zstd` 또는 uncompressed를 허용하되 run summary에 기록한다.

## Silver schema

### `silver_user_events`

| 컬럼 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| `event_at` | `timestamp` | no | 이벤트 시각 |
| `event_date` | `date` | no | 이벤트 일자 |
| `event_type` | `string` | no | `view`, `cart`, `remove_from_cart`, `purchase` |
| `internal_product_id` | `string` | no | 합성 공통 product key |
| `source_product_id` | `string` | no | Kaggle 원천 product id |
| `category_id` | `string` | yes | 원천 또는 정규화 category |
| `category_code` | `string` | yes | Kaggle category code |
| `brand` | `string` | yes | 브랜드 |
| `event_price` | `double` | yes | 이벤트 가격 |
| `user_id` | `string` | yes | 사용자 id |
| `session_id` | `string` | yes | 세션 id |

### `silver_product_reviews`

| 컬럼 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| `review_at` | `timestamp` | yes | 리뷰 시각 |
| `review_date` | `date` | yes | 리뷰 일자 |
| `internal_product_id` | `string` | no | 합성 공통 product key |
| `amazon_parent_asin` | `string` | no | Amazon parent ASIN |
| `rating` | `double` | yes | 평점 |
| `review_title` | `string` | yes | 리뷰 제목 |
| `review_text` | `string` | yes | 리뷰 본문 |
| `verified_purchase` | `boolean` | yes | 구매 확인 여부 |
| `helpful_vote` | `int64` | yes | 도움표 |
| `review_sentiment` | `string` | yes | `positive`, `neutral`, `negative` |
| `complaint_topic` | `string` | yes | rule 기반 불만 토픽 |

### `silver_product_catalog`

| 컬럼 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| `internal_product_id` | `string` | no | 합성 공통 product key |
| `product_title` | `string` | no | 상품명 |
| `category_l1` | `string` | yes | 대분류 |
| `category_l2` | `string` | yes | 중분류 |
| `category_l3` | `string` | yes | 소분류 |
| `brand` | `string` | yes | 브랜드 또는 판매자 |
| `product_image_path` | `string` | yes | MEP/Amazon image path 또는 URL 참조 |
| `product_text` | `string` | yes | title/description/OCR 결합 text |
| `source_catalog` | `string` | no | `mep`, `amazon_meta`, `synthetic_merge` |
| `source_product_id` | `string` | no | 원천 product id |

### `silver_delivery_trip_logs`

| 컬럼 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| `delivery_trip_id` | `string` | no | 배송 로그 id |
| `delivery_started_at` | `timestamp` | no | 배송 출발 시각 |
| `delivered_at` | `timestamp` | no | 배송 완료 시각 |
| `delivery_date` | `date` | no | 배송 완료 일자 |
| `internal_product_id` | `string` | no | 합성 공통 product key |
| `fulfillment_zone_id` | `string` | yes | 출고 지역 |
| `customer_zone_id` | `string` | yes | 배송 지역 |
| `delivery_distance` | `double` | yes | 배송 거리 |
| `total_delivery_cost` | `double` | yes | 총 배송 비용 |
| `delivery_duration_minutes` | `double` | yes | 배송 소요 시간 |
| `carrier_id` | `string` | yes | 배송 파트너 |
| `is_late_delivery` | `boolean` | no | 지연 여부 |

## Seed mapping schema

`seed_product_mapping`은 합성데이터의 핵심 lineage다. 원천 간 실제 공통 키가 없다는 사실을 숨기지 않기 위해 반드시 별도 파일로 남긴다.

| 컬럼 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| `internal_product_id` | `string` | no | `aph_prod_000001` 형식 |
| `ecommerce_product_id` | `string` | yes | Kaggle product id |
| `amazon_parent_asin` | `string` | yes | Amazon parent ASIN |
| `mep_product_id` | `string` | yes | MEP product/sample id |
| `category_normalized` | `string` | yes | 정규화 category |
| `mapping_method` | `string` | no | `category_title_match`, `synthetic_seed`, `manual_demo_mapping` |
| `mapping_confidence` | `double` | no | `0.0`~`1.0` |

`internal_product_id`는 seed와 정렬 순서가 고정된 deterministic id로 만든다. 예시는 `aph_prod_000001`이다.

## Gold schema

### `gold_product_health`

| 컬럼 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| `period_start` | `date` | no | 집계 시작일 |
| `period_end` | `date` | no | 집계 종료일 |
| `internal_product_id` | `string` | no | 합성 공통 product key |
| `category_id` | `string` | yes | category |
| `category_l1` | `string` | yes | 대분류 |
| `category_l2` | `string` | yes | 중분류 |
| `brand` | `string` | yes | brand |
| `product_title` | `string` | yes | 상품명 |
| `view_count` | `int64` | no | 조회 수 |
| `cart_count` | `int64` | no | 장바구니 수 |
| `purchase_count` | `int64` | no | 구매 수 |
| `estimated_revenue` | `double` | no | purchase event price 기반 추정 매출 |
| `conversion_rate` | `double` | no | `purchase_count / view_count` |
| `avg_rating` | `double` | yes | 평균 평점 |
| `review_count` | `int64` | no | 리뷰 수 |
| `negative_review_rate` | `double` | no | 부정 리뷰 비율 |
| `top_complaint_topics` | `array<string>` | yes | 대표 불만 토픽 |
| `delivery_count` | `int64` | no | 배송 로그 수 |
| `avg_delivery_duration_minutes` | `double` | yes | 평균 배송 시간 |
| `late_delivery_rate` | `double` | no | 지연 배송 비율 |
| `avg_delivery_cost` | `double` | yes | 평균 배송 비용 |
| `risk_score` | `double` | no | 0~100 상품 운영 리스크 점수 |
| `source_row_count_behavior` | `int64` | no | behavior 기여 row 수 |
| `source_row_count_reviews` | `int64` | no | review 기여 row 수 |
| `source_row_count_delivery` | `int64` | no | delivery 기여 row 수 |
| `mapping_method` | `string` | no | 대표 mapping method |

## Metric 계산식

분모가 0이면 rate는 `0.0`으로 둔다.

| Metric | 공식 |
| --- | --- |
| `view_count` | `event_type = 'view'` count |
| `cart_count` | `event_type = 'cart'` count |
| `purchase_count` | `event_type = 'purchase'` count |
| `estimated_revenue` | `sum(event_price where event_type = 'purchase')` |
| `conversion_rate` | `purchase_count / view_count` |
| `negative_review_rate` | `count(review_sentiment = 'negative') / review_count` |
| `late_delivery_rate` | `count(is_late_delivery = true) / delivery_count` |
| `avg_delivery_duration_minutes` | `avg(delivery_duration_minutes)` |
| `risk_score` | `round(100 * (0.4 * (1 - conversion_rate_norm) + 0.35 * negative_review_rate + 0.25 * late_delivery_rate), 2)` |

`conversion_rate_norm`은 Gold 전체 상품의 `conversion_rate`를 min-max normalize한 값이다. 모든 상품의 conversion rate가 같으면 `conversion_rate_norm = 0.5`로 둔다.

`review_sentiment` 기본 규칙:

| 조건 | label |
| --- | --- |
| `rating <= 2` | `negative` |
| `rating = 3` | `neutral` |
| `rating >= 4` | `positive` |

`complaint_topic`은 rule/template 기반으로 시작한다. keyword match가 없으면 `general_complaint` 또는 null을 허용한다.

## Catalog handoff JSON

`catalog/product_health_source_handoff.json`은 사이트 기반 연결 흐름을 위한 source contract다. 데모의 기본 흐름은 local path 직접 선택이 아니라 `External Connection -> Source Dataset -> Target Dataset job draft -> Catalog ingest`다. local path는 개발/검증 fallback으로만 유지한다.

필수 source id는 아래를 사용한다.

| Source role | External Connection | Source Dataset | 기본 연결 방식 |
| --- | --- | --- | --- |
| behavior | `conn_product_health_local_sources` | `source_ecommerce_behavior_events` | local folder CSV |
| review | `conn_product_health_local_sources` | `source_amazon_product_reviews` | local folder JSONL |
| review metadata | `conn_product_health_local_sources` | `source_amazon_product_metadata` | local folder JSONL |
| product catalog | `conn_product_health_local_sources` | `source_mep_product_catalog` | local folder JSON |
| delivery | `conn_taxi_postgres` | `source_taxi_delivery_logs` | PostgreSQL table, local parquet fallback |

Taxi는 PR #297 또는 동등한 source registration이 머지되면 `conn_taxi_postgres`를 우선 사용한다. 그 전까지 smoke/evidence generator는 `taxi_existing/yellow_tripdata_2019_2025/*.parquet` fallback을 읽되, run summary에는 같은 `source_dataset_id`를 남긴다.

`catalog/dataset_product_health_gold.json`은 최소 아래 shape를 가진다.

```json
{
  "dataset_id": "dataset_product_health_gold",
  "table_name": "gold_product_health",
  "storage": {
    "format": "parquet",
    "local_fallback_path": "data/local_sources/product_health/gold/gold_product_health.parquet"
  },
  "query": {
    "engine": "duckdb",
    "table_name": "gold_product_health",
    "default_limit": 50,
    "allowed_columns": [
      "internal_product_id",
      "category_l1",
      "category_l2",
      "brand",
      "product_title",
      "conversion_rate",
      "negative_review_rate",
      "late_delivery_rate",
      "risk_score"
    ]
  },
  "lineage": {
    "source_handoff_path": "data/local_sources/product_health/catalog/product_health_source_handoff.json",
    "sources": [
      {
        "source_dataset_id": "source_ecommerce_behavior_events",
        "connection_id": "conn_product_health_local_sources",
        "name": "Ecommerce Behavior Events"
      },
      {
        "source_dataset_id": "source_amazon_product_reviews",
        "connection_id": "conn_product_health_local_sources",
        "name": "Amazon Product Reviews"
      },
      {
        "source_dataset_id": "source_taxi_delivery_logs",
        "connection_id": "conn_taxi_postgres",
        "name": "Taxi Delivery Logs"
      }
    ],
    "mapping_dataset": "silver/seed_product_mapping.parquet"
  }
}
```

M5가 실제 CatalogMetadata schema를 이미 갖고 있으면 이 JSON은 해당 schema로 변환해도 된다. 단 `dataset_id`, `table_name`, `local_fallback_path`, `allowed_columns`, lineage source 목록은 보존한다.

## Run evidence JSON

`evidence/product_health_run_summary.json`은 최소 아래 항목을 가진다.

| 필드 | 설명 |
| --- | --- |
| `run_id` | 실행 id |
| `pipeline_id` | `pipeline_product_health_e2e` |
| `status` | `succeeded` 또는 실패 상태 |
| `random_seed` | `20260630` |
| `evidence_mode` | `source_inventory_and_row_limited_smoke_transform` 또는 `processed_5gb_evidence_run` |
| `available_source_total_bytes` | 로컬에 준비된 source file bytes 합계 |
| `processed_input_total_bytes` | 이번 실행에서 실제 처리한 input bytes 합계. smoke에서 byte 측정이 없으면 null 허용 |
| `processed_input_total_bytes_status` | smoke 또는 미측정 사유 |
| `input_total_bytes` | 하위 호환 필드. PH-DATA-3 이후에는 `processed_input_total_bytes`와 같은 의미로 사용한다 |
| `input_total_bytes_semantics` | 하위 호환 필드의 의미. smoke에서는 `available_source_bytes_for_backward_compatibility_not_5gb_processed_evidence` |
| `source_handoff_path` | `catalog/product_health_source_handoff.json` |
| `sources[]` | source별 `connection_id`, `source_dataset_id`, path, row_count_sample, available_source_bytes, processed_input_bytes, duration_ms |
| `outputs[]` | output별 path, row_count, bytes. output bytes는 Gold/input 5GB 처리 증거가 아니다 |
| `gold_dataset_id` | `dataset_product_health_gold` |
| `gold_table_name` | `gold_product_health` |
| `notes[]` | fallback, skipped source, compression 등 |

## 모듈별 handoff

| 모듈 | 받는 것 | 기대 동작 |
| --- | --- | --- |
| M1 | source handoff, `dataset_product_health_gold` metadata, run summary | External Connection/Source Dataset 선택, dataset card, schema preview, evidence, 질문 CTA 표시 |
| M2 | input paths, output paths, TransformSpec 후보 | local/Spark runtime에서 같은 result shape로 실행 |
| M3 | source schema, silver/gold schema, metric 공식 | transform logic 구현과 테스트 |
| M4 | behavior event source shape | 후속 Kafka replay가 붙을 때 event schema를 맞춤 |
| M5 | source handoff JSON, catalog handoff JSON, run summary, output parquet | ExternalConnection/SourceDataset/CatalogMetadata, lineage 저장 |
| M6 | CatalogMetadata, Gold parquet path, allowed columns | DuckDB SQL MVP와 answer grounding |

## 완료 기준

- `gold/gold_product_health.parquet`가 생성된다.
- `catalog/dataset_product_health_gold.json`이 생성된다.
- `catalog/product_health_source_handoff.json`이 생성되고 5개 source dataset id를 포함한다.
- `evidence/product_health_run_summary.json`이 생성된다.
- `gold_product_health`에 대표 질문에 필요한 컬럼이 모두 존재한다.
- `risk_score`, `conversion_rate`, `negative_review_rate`, `late_delivery_rate`가 null 없이 계산된다.
- `seed_product_mapping.parquet`에 `mapping_method`와 `mapping_confidence`가 존재한다.
- DuckDB 또는 동등한 local SQL engine으로 Gold parquet를 SELECT할 수 있다.
- 5GB evidence run을 수행하지 못한 경우, `available_source_total_bytes`와 `processed_input_total_bytes`를 분리하고 smoke run과 5GB blocker를 run summary에 명시한다.

## Manual verification

1. `data/local_sources/product_health/raw/` 아래 필수 source 파일이 있는지 확인한다.
2. 합성데이터 생성 스크립트를 smoke mode로 실행한다.
3. `silver/`와 `gold/` output 파일이 생성됐는지 확인한다.
4. Gold row count가 0보다 큰지 확인한다.
5. Gold schema에 `risk_score`, `conversion_rate`, `negative_review_rate`, `late_delivery_rate`가 있는지 확인한다.
6. `catalog/dataset_product_health_gold.json`의 `local_fallback_path`가 실제 파일을 가리키는지 확인한다.
7. `catalog/product_health_source_handoff.json`에 5개 source dataset id와 target dataset id가 있는지 확인한다.
8. `evidence/product_health_run_summary.json`의 `sources[]`에 `connection_id`, `source_dataset_id`가 있는지 확인한다.
9. DuckDB로 `select * from gold_product_health order by risk_score desc limit 10`을 실행한다.
10. 결과 상위 row가 M1/M6 대표 질문의 evidence로 사용할 수 있는지 확인한다.

## 후속 Phase 후보

| Phase | 목적 | 완료 기준 |
| --- | --- | --- |
| PH-DATA-0 | Raw sample profiling & contract calibration | 원본 sample profile과 계약 보정 제안 생성 |
| PH-DATA-1 | Synthetic data script smoke | 위 계약의 smoke output 생성 |
| PH-DATA-1B | Scenario bucket calibration | 데모 질문에 맞는 risk pattern과 설명 컬럼 보정 |
| PH-DATA-2 | Taxi local file 연결 | 보유 Taxi 5GB 파일을 delivery source로 연결 |
| PH-DATA-2B | External Connection handoff alignment | 사이트 기반 External Connection/Source Dataset id와 local evidence를 정렬 |
| PH-DATA-2C | Smoke byte semantics alignment | 준비된 원천 bytes와 실제 처리 bytes를 분리해 5GB evidence 오해를 막음 |
| PH-DATA-3 | 5GB evidence run | `processed_input_total_bytes >= 5GB` run summary 생성 |
| PH-DATA-4 | M5 Catalog ingest | handoff JSON을 실제 CatalogMetadata로 등록 |
| PH-DATA-5 | M6 SQL grounding | Gold parquet를 실제 SQL/answer evidence로 사용 |

각 Phase 실행 문서는 아래 workspace에 둔다.

| Phase | Workspace |
| --- | --- |
| PH-DATA-0 | `docs/workflows/feature/product-health-raw-profiling/` |
| PH-DATA-1 | `docs/workflows/feature/product-health-synthetic-smoke/` |
| PH-DATA-1B | `docs/workflows/feature/product-health-scenario-calibration/` |
| PH-DATA-2 | `docs/workflows/feature/product-health-taxi-source-link/` |
| PH-DATA-2B | `docs/workflows/feature/product-health-connection-handoff/` |
| PH-DATA-2C | `docs/workflows/feature/product-health-smoke-byte-semantics/` |
| PH-DATA-3 | `docs/workflows/feature/product-health-5gb-evidence/` |
| PH-DATA-4 | `docs/workflows/feature/product-health-catalog-ingest/` |
| PH-DATA-5 | `docs/workflows/feature/product-health-sql-grounding/` |
