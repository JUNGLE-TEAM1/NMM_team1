# Product Health 데모 데이터 설계서

## 문서 목적

이 문서는 AskLake Week2 대표 데모인 `gold_product_health` / `dataset_product_health_gold`를 만들기 위한 데모 데이터 설계를 정리한다.

핵심은 공개 원천 데이터 4종을 그대로 같은 회사 데이터라고 주장하지 않고, 자사 쇼핑몰 운영팀 시나리오에 맞게 `Bronze -> Silver -> Gold` 구조로 표준화하고, 원천 간 공통 키가 없는 부분은 `seed_product_mapping`으로 명시하는 것이다.

이 문서는 `docs/project-context/`의 참고 설계서다. 합성데이터 생성을 별도 작업으로 분리할 때의 입력, 출력, schema, metric, 검증 계약은 [`product-health-synthetic-data-contract.md`](product-health-synthetic-data-contract.md)에 둔다. 구현 계약으로 확정되는 API, schema, 파일 경로, 검증 기준은 이후 `docs/02`, `docs/03`, `docs/05`, `docs/07`, `contracts/`로 전파한다.

## 데모 시나리오

서비스 타깃은 자사 쇼핑몰 운영팀, 상품운영 PM, 데이터 분석가다.

대표 질문은 다음으로 고정한다.

```text
조회 수는 증가했지만 구매 전환율이 하락한 카테고리를 찾고,
리뷰 불만과 배송 성과를 함께 분석해줘.
```

이 질문은 행동 로그, 상품 카탈로그, 리뷰/VOC, 배송 로그를 모두 사용한다.

| 질문 요소 | 사용하는 데이터 |
| --- | --- |
| 조회 수 증가 | Kaggle eCommerce Behavior |
| 구매 전환율 하락 | Kaggle eCommerce Behavior |
| 상품/카테고리/브랜드 | MEP-3M + Amazon metadata |
| 리뷰 불만/평점 | Amazon Reviews 2023 |
| 배송 지연/배송 비용 | NYC TLC Taxi를 라스트마일 배송 로그로 매핑 |

## 원천 데이터 역할

| 원천 데이터 | AskLake 역할 | 데모 표현 |
| --- | --- | --- |
| Kaggle eCommerce Behavior | 사용자 행동 event source | 자사몰 웹/앱 조회, 장바구니, 구매 이벤트 |
| Amazon Reviews 2023 | 리뷰/VOC fact source | 고객 리뷰, 평점, 불만 토픽 |
| MEP-3M | 상품 catalog/dimension source | 상품명, 계층 카테고리, OCR, image path |
| NYC TLC Taxi | 배송/배차 log source | 라스트마일 배송 수행 로그 시뮬레이션 |

택시 데이터는 실제 쇼핑몰 배송 데이터라고 말하지 않는다. 발표에서는 다음 문구를 사용한다.

```text
NYC Taxi Trip 데이터는 대규모 시간, 지역, 거리 기반 운행 로그이므로,
라스트마일 배송 성과를 시뮬레이션하는 정형 로그 소스로 사용했습니다.
```

원천 간 실제 상품 공통 키도 없다고 명시한다.

```text
공개 데이터셋 특성상 원천 간 실제 공통 키는 없기 때문에,
데모에서는 상품, 카테고리, 지역 기준의 seed mapping table을 만들어
자사몰 데이터 레이크 시나리오를 구성했습니다.
```

## 다운로드 범위

전체 원본 다운로드는 데모 준비 범위를 넘는다. 먼저 작은 개발용 subset을 받고, 발표 smoke와 대용량 evidence를 분리한다.

| 원천 | 개발용 목표 | 발표 smoke 목표 | 대용량 evidence 목표 |
| --- | ---: | ---: | ---: |
| Amazon Reviews 2023 | 100MB~300MB | 1GB 내외 | 선택 카테고리 3GB~5GB 후보 |
| MEP-3M | metadata/text/category 100MB~300MB | metadata 500MB~1GB | image 제외 2GB~5GB 후보 |
| Kaggle eCommerce Behavior | 300MB~700MB | 1GB~2GB | 필요 시 3GB~5GB 후보 |
| NYC TLC Taxi | 기존 5GB에서 100MB sample | 기존 5GB 사용 | 기존 5GB 사용 |

초기 추천 다운로드는 다음이다.

```text
Amazon Reviews 2023: 200MB
MEP-3M: metadata/text/category only 200MB
Kaggle eCommerce Behavior: 500MB
NYC TLC Taxi: 보유 5GB 유지 + 100MB sample 생성
```

MEP-3M은 이미지가 있지만 MVP에서는 이미지 모델을 돌리지 않는다. `image_path`, OCR text, title, category metadata만 먼저 사용하고, 이미지 파일 자체는 아주 작은 sample만 선택적으로 둔다.

## 로컬 폴더 구조

로컬 개발/데모 데이터는 repo에 commit하지 않는다. 기본 위치는 workspace 밖 또는 `.gitignore`된 `data/` 아래로 둔다.

```text
data/local_sources/product_health/
  raw/
    ecommerce_behavior_sample.csv
    amazon_reviews_sample.jsonl
    amazon_product_metadata_sample.jsonl
    mep_product_catalog_sample.csv
    tlc_trip_records_sample.parquet
  silver/
    silver_user_events.parquet
    silver_product_reviews.parquet
    silver_product_catalog.parquet
    silver_delivery_trip_logs.parquet
    seed_product_mapping.parquet
  gold/
    gold_category_funnel_daily.parquet
    gold_product_voc_summary.parquet
    gold_delivery_performance_daily.parquet
    gold_product_catalog_enriched.parquet
    gold_product_health.parquet
```

API/UI의 `External Connection`은 우선 `Local Folder` 또는 `Local File` 타입으로 이 root를 등록한다.

```text
connection_id: conn_product_health_local_sources
connection_type: local_folder
root_path: data/local_sources/product_health/raw
```

## Bronze 모델

Bronze는 원본 컬럼을 가능한 그대로 보존한다.

| Bronze dataset | 원천 | 핵심 컬럼 |
| --- | --- | --- |
| `bronze_ecommerce_events` | Kaggle eCommerce Behavior | `event_time`, `event_type`, `product_id`, `category_id`, `category_code`, `brand`, `price`, `user_id`, `user_session` |
| `bronze_amazon_reviews` | Amazon Reviews 2023 | `rating`, `title`, `text`, `asin`, `parent_asin`, `user_id`, `timestamp`, `verified_purchase`, `helpful_vote` |
| `bronze_amazon_product_metadata` | Amazon Reviews 2023 metadata | `parent_asin`, `title`, `average_rating`, `rating_number`, `features`, `description`, `price`, `images`, `categories` |
| `bronze_mep_products` | MEP-3M | `class_id`, `class_name`, `sub_class_id`, `sub_class_name`, `img_path`, `title`, `OCR`, `img_resolution` |
| `bronze_tlc_trip_records` | NYC TLC Taxi | `vendor_id`, `pickup_datetime`, `dropoff_datetime`, `pickup_location_id`, `dropoff_location_id`, `trip_distance`, `fare_amount`, `total_amount` |

## Silver 모델

Silver는 AskLake 데모 도메인에 맞춰 의미 컬럼을 표준화한다.

### `silver_user_events`

| 컬럼 | 설명 |
| --- | --- |
| `event_at` | 표준화된 이벤트 시각 |
| `event_type` | `view`, `cart`, `remove_from_cart`, `purchase` |
| `internal_product_id` | 합성 공통 product key |
| `category_id` | 표준 category id |
| `brand` | 브랜드 |
| `event_price` | 이벤트 기준 가격 |
| `user_id` | 사용자 id |
| `session_id` | 세션 id |

### `silver_product_reviews`

| 컬럼 | 설명 |
| --- | --- |
| `review_at` | 리뷰 시각 |
| `internal_product_id` | 합성 공통 product key |
| `rating` | 평점 |
| `review_title` | 리뷰 제목 |
| `review_text` | 리뷰 본문 |
| `verified_purchase` | 구매 확인 여부 |
| `helpful_vote` | 도움표 |
| `review_sentiment` | rule/template 기반 감성 label |
| `complaint_topic` | rule/template 기반 불만 토픽 |

### `silver_product_catalog`

| 컬럼 | 설명 |
| --- | --- |
| `internal_product_id` | 합성 공통 product key |
| `product_title` | 상품명 |
| `category_l1` | 대분류 |
| `category_l2` | 중분류 |
| `category_l3` | 소분류 |
| `brand` | 브랜드 또는 판매자 |
| `product_image_path` | MEP/Amazon image path 또는 URL 참조 |
| `product_text` | title/description/OCR 결합 text |
| `source_product_id` | 원천 product id |

### `silver_delivery_trip_logs`

| 컬럼 | 설명 |
| --- | --- |
| `delivery_trip_id` | 배송 로그 id |
| `delivery_started_at` | 배송 출발 시각 |
| `delivered_at` | 배송 완료 시각 |
| `fulfillment_zone_id` | 출고 지역 |
| `customer_zone_id` | 고객 배송 지역 |
| `delivery_distance` | 배송 거리 |
| `total_delivery_cost` | 총 배송 비용 |
| `delivery_duration_minutes` | 배송 소요 시간 |
| `carrier_id` | 배송 파트너 |

## Seed Mapping

`seed_product_mapping`은 합성 데이터의 신뢰성을 위해 반드시 별도 데이터셋으로 둔다.

| 컬럼 | 설명 |
| --- | --- |
| `internal_product_id` | AskLake 데모 공통 product key |
| `ecommerce_product_id` | Kaggle behavior product id |
| `amazon_parent_asin` | Amazon Reviews parent ASIN |
| `mep_product_id` | MEP product/sample id |
| `category_normalized` | 정규화 category |
| `mapping_method` | `exact`, `category_title_match`, `synthetic_seed`, `manual_demo_mapping` |

`mapping_method`는 카탈로그와 lineage에 노출한다. 원천 데이터가 실제 같은 회사의 동일 상품이라고 숨기지 않는다.

## Taxi to Delivery 매핑

| TLC Taxi 원본 컬럼 | Silver 배송 컬럼 | 의미 |
| --- | --- | --- |
| `VendorID` | `carrier_id` | 배송 대행사 또는 물류 파트너 |
| `tpep_pickup_datetime` / `lpep_pickup_datetime` | `delivery_started_at` | 배송 출발 시각 |
| `tpep_dropoff_datetime` / `lpep_dropoff_datetime` | `delivered_at` | 배송 완료 시각 |
| `PULocationID` | `fulfillment_zone_id` | 물류센터 또는 출고 지역 |
| `DOLocationID` | `customer_zone_id` | 고객 배송 지역 |
| `trip_distance` | `delivery_distance` | 배송 거리 |
| `fare_amount` | `base_delivery_cost` | 기본 배송비 |
| `tolls_amount` | `toll_cost` | 통행료성 비용 |
| `total_amount` | `total_delivery_cost` | 총 배송 비용 |
| `RatecodeID` | `delivery_service_level` | 일반/특급 등 서비스 레벨 코드 |
| `payment_type` | `settlement_type` | 정산 방식 |
| `congestion_surcharge` | `congestion_cost` | 혼잡 지역 비용 |

## Gold 모델

### `gold_category_funnel_daily`

| 컬럼 | 설명 |
| --- | --- |
| `event_date` | 일자 |
| `category_id` | category |
| `brand` | brand |
| `view_count` | 조회 수 |
| `cart_count` | 장바구니 수 |
| `purchase_count` | 구매 수 |
| `view_to_cart_rate` | 조회 대비 장바구니 전환 |
| `cart_to_purchase_rate` | 장바구니 대비 구매 전환 |
| `purchase_conversion_rate` | 조회 대비 구매 전환 |

### `gold_product_voc_summary`

| 컬럼 | 설명 |
| --- | --- |
| `period` | 집계 기간 |
| `internal_product_id` | 상품 id |
| `category_id` | category |
| `avg_rating` | 평균 평점 |
| `low_rating_ratio` | 저평점 비율 |
| `verified_review_count` | 구매 확인 리뷰 수 |
| `top_complaint_topics` | 대표 불만 토픽 |
| `representative_reviews` | 대표 리뷰 예시 |

### `gold_delivery_performance_daily`

| 컬럼 | 설명 |
| --- | --- |
| `delivery_date` | 배송 일자 |
| `fulfillment_zone_id` | 출고 지역 |
| `customer_zone_id` | 배송 지역 |
| `delivery_count` | 배송 건수 |
| `avg_delivery_duration_minutes` | 평균 배송 시간 |
| `p95_delivery_duration_minutes` | p95 배송 시간 |
| `avg_delivery_distance` | 평균 배송 거리 |
| `avg_delivery_cost` | 평균 배송 비용 |
| `late_delivery_rate` | 지연 배송 비율 |

### `gold_product_catalog_enriched`

| 컬럼 | 설명 |
| --- | --- |
| `internal_product_id` | 상품 id |
| `product_title` | 상품명 |
| `category_l1` | 대분류 |
| `category_l2` | 중분류 |
| `category_l3` | 소분류 |
| `brand` | 브랜드 |
| `image_path` | 이미지 경로/참조 |
| `text_description` | 상품 설명 |
| `ocr_text` | OCR 텍스트 |
| `source_catalog` | MEP/Amazon 등 원천 |

### `gold_product_health`

`gold_product_health`가 AskLake 대표 데모의 최종 통합 Gold dataset이다. `gold_product_ops_health`는 이전 설계 alias로만 취급하고 새 구현과 catalog metadata에는 `gold_product_health`를 사용한다.

| 컬럼 | 설명 |
| --- | --- |
| `period` | 집계 기간 |
| `category_id` | category |
| `brand` | brand |
| `internal_product_id` | 상품 id |
| `estimated_revenue` | behavior purchase event 기반 추정 매출 |
| `order_count` | purchase count |
| `purchase_conversion_rate` | 구매 전환율 |
| `avg_rating` | 평균 평점 |
| `low_rating_ratio` | 저평점 비율 |
| `top_complaint_topics` | 대표 불만 토픽 |
| `avg_delivery_duration_minutes` | 평균 배송 시간 |
| `late_delivery_rate` | 지연 배송 비율 |
| `avg_delivery_cost` | 평균 배송 비용 |
| `ops_health_score` | 운영 리스크/건강도 점수 |

`estimated_revenue`는 실제 결제 원장이 아니라 behavior `purchase` event와 `price` 기반 추정 매출이라고 표시한다.

## AskLake Source Dataset 표시

M1 Dataset 화면에서는 처음부터 Bronze/Silver/Gold 전체를 노출하기보다 Source 등록 단계에서 아래 4개 원천을 보여준다.

| UI Source Dataset | 파일 타입 | 원천 | AskLake role |
| --- | --- | --- | --- |
| `Ecommerce Behavior Events` | CSV 또는 Parquet | Kaggle eCommerce Behavior | 행동/구매 funnel |
| `Amazon Product Reviews` | JSONL 또는 Parquet | Amazon Reviews 2023 | 리뷰/VOC |
| `MEP Product Catalog` | CSV 또는 Parquet + image path | MEP-3M | 상품 catalog |
| `TLC Delivery Logs` | Parquet | NYC TLC Taxi | 배송 로그 시뮬레이션 |

Target Dataset 생성은 초기에는 단일 Source 선택으로 smoke를 유지할 수 있다. 대표 경로로 승격하려면 Target Dataset Source 선택을 다중 Source 선택으로 확장해야 한다.

## No-code DAG 개념

```text
Source: Ecommerce Behavior Events
Source: Amazon Product Reviews
Source: MEP Product Catalog
Source: TLC Delivery Logs
        |
Transform:
- timestamp 표준화
- product/category seed mapping
- review text 정제 및 complaint topic 추출
- delivery duration 계산
- delivery cost 계산
        |
Gold:
- gold_category_funnel_daily
- gold_product_voc_summary
- gold_delivery_performance_daily
- gold_product_catalog_enriched
- gold_product_health
```

## 구현 Phase 후보

| Phase | 목적 | 완료 기준 |
| --- | --- | --- |
| D-1 Local source discovery | `Local Folder` connection에서 raw sample 파일 목록을 감지한다. | Source Dataset 후보 4개가 화면에 표시된다. |
| D-2 Schema inference | CSV/JSONL/Parquet sample에서 schema preview와 row/bytes sample evidence를 만든다. | `schema_preview`, `row_count_sample`, `bytes_sample`가 저장된다. |
| D-3 Seed mapping generation | 공통 `internal_product_id`와 `seed_product_mapping`을 만든다. | mapping table과 `mapping_method`가 카탈로그에 표시된다. |
| D-4 Silver transform | 원천 4개를 Silver dataset으로 표준화한다. | Silver output path와 source-level evidence가 남는다. |
| D-5 Gold product health | `gold_product_health`를 생성한다. | M5 Catalog와 M6 SQL query가 읽을 수 있다. |
| D-6 M1/M6 demo flow | 대표 자연어 질문과 evidence 표시를 연결한다. | M1에서 질문, SQL, chart, evidence, lineage가 한 흐름으로 보인다. |

## MVP 제외 범위

- MEP 이미지 모델 inference
- 실제 매출/원가/영업이익 계산
- 실제 쇼핑몰 배송 데이터라고 주장하는 표현
- 원천 간 실제 user/product/order key가 있다고 주장하는 표현
- 전체 Amazon Reviews 2023 / 전체 MEP-3M / 전체 Kaggle behavior 다운로드
- Kafka streaming to Gold를 1차 대표 path의 선행 조건으로 만드는 것
- 외부 LLM에 원본 파일 전체, local fallback path, credential, API key를 보내는 것

## 발표 문구

```text
AskLake는 서로 다른 형식과 출처의 행동 로그, 상품 카탈로그, 리뷰/VOC, 배송 로그를
하나의 데이터 레이크 모델로 정리하고, 변환 과정과 매핑 방식을 카탈로그와 lineage에 남깁니다.
공개 데이터셋 특성상 실제 공통 키는 없기 때문에, 데모에서는 seed mapping table을 사용해
자사몰 운영 분석 시나리오를 구성했습니다.
```

```text
운영팀은 조회 수는 늘었지만 구매 전환율이 떨어진 카테고리를 찾고,
리뷰 불만과 배송 성과가 함께 악화되는지 자연어로 확인할 수 있습니다.
```
