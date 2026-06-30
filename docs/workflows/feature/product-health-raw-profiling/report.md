# PH-DATA-0 보고서

## 상태

Completed.

## 변경 요약

- `scripts/product_health_raw_profile.py`를 추가해 Product Health raw source 4종을 profile했다.
- `data/local_sources/product_health/evidence/raw_profile_report.json`을 생성했다.
- `data/local_sources/product_health/evidence/raw_profile_summary.md`를 생성했다.
- Taxi raw data는 `data/local_sources/product_health/raw/taxi_existing/` symlink를 통해 연결된 상태에서 확인했다.

## 검증

| Source | Format | Rows / files | Bytes | 상태 |
| --- | --- | ---: | ---: | --- |
| Kaggle 2019-Oct | CSV | 약 42,652,513 rows | 5,668,612,855 | passed |
| Kaggle 2019-Nov | CSV | 약 68,738,064 rows | 9,006,762,395 | passed |
| Amazon Reviews All_Beauty | JSONL | 약 456,974 rows | 326,611,506 | passed |
| Amazon Metadata All_Beauty | JSONL | 약 110,725 rows | 212,990,142 | passed |
| MEP annotations-1k | JSON | 1,000 rows | 539,809 | passed |
| MEP annotations full | JSON | large array, file-size only | 1,698,563,323 | partial by design |
| MEP dataset_info | XLSX | 100 sampled rows | 38,954 | passed |
| Taxi 2019-2025 | Parquet directory | 308,010,490 rows | 4,871,531,583 | passed |
| Taxi 2026 partial | Parquet directory | 14,908,446 rows | 255,557,797 | passed |

계약 보정 포인트:

- Kaggle `category_code`는 dotted category지만 blank row가 있으므로 `category_code -> category_id` fallback이 필요하다.
- Amazon `timestamp`는 ISO 문자열이 아니라 epoch millisecond로 보인다.
- MEP full annotations는 1.6GB JSON array라 smoke에서는 `annotations-1k.json`을 우선 사용한다.
- Taxi pickup datetime에는 `2001`, `2098` 같은 이상치가 있어 PH-DATA-1에서 demo window filter가 필요하다.
- local preparation path와 M5 Catalog output path convention은 PH-DATA-4에서 정렬해야 한다.

## Handoff

PH-DATA-1은 아래 smoke input을 기준으로 시작한다.

- behavior: `raw/kaggle_ecommerce_behavior/2019-Oct.csv`
- review: `raw/amazon_reviews_2023/raw/review_categories/All_Beauty.jsonl`
- review metadata: `raw/amazon_reviews_2023/raw/meta_categories/meta_All_Beauty.jsonl`
- product catalog: `raw/mep_3m/annotations-1k.json`
- delivery: `raw/taxi_existing/yellow_tripdata_2019_2025/*.parquet`
