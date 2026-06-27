# Week2 M1 delivery synthetic auxiliary seed handoff

## 전달 대상

- M5/M6 분석 보조 데이터 소비자
- 필요 시 M3 보조 synthetic source 검토자

## 한 줄 요약

NYC TLC Yellow Taxi 2024-01 Parquet 원본에서 100,000행 규모의 synthetic delivery seed를 생성했다. 이 데이터는 실제 배송 원천이 아니며, M3 main raw가 아니라 M5/M6 분석 보조 synthetic dataset이다.

## 산출물

생성 산출물은 local ignored `data/` 아래에 있다.

| File | Role | Rows | Commit 여부 |
| --- | --- | ---: | --- |
| `data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.jsonl` | canonical auxiliary JSONL | 100,000 | no |
| `data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.parquet` | Spark/M5/M6 convenience copy | 100,000 | no |
| `data/week2/mvp_synthesis/metadata/source_manifest.json` | generated source lineage/caveat | n/a | no |
| `data/week2/mvp_synthesis/metadata/raw_demo_summary.json` | generated summary/profile | n/a | no |

PR에는 generated data를 올리지 않고, 재생성 가능한 script/test/workspace evidence만 포함한다.

## 필드 shape

`delivery_trips_seed.jsonl` row는 아래 필드를 가진다.

```json
{
  "delivery_id": "D00000001",
  "order_id": "O00000001",
  "product_id": "P000001",
  "delivery_started_at": "2024-01-01T00:57:55Z",
  "delivered_at": "2024-01-01T01:17:43Z",
  "delivery_duration_minutes": 20,
  "delivery_distance_km": 2.768,
  "total_delivery_cost_amount": 22.7,
  "currency": "USD",
  "late_minutes": 0,
  "late_delivery_flag": false,
  "is_late_60": false,
  "late_threshold_minutes": 60,
  "delivery_status": "delivered",
  "source_dataset_id": "nyc_taxi",
  "source_taxi_trip_id": "yellow_tripdata_2024-01:00000001",
  "source_taxi_row_hash": "...",
  "is_synthetic_source": true,
  "synthetic_generation_version": "v1",
  "synthetic_rule_id": "taxi_to_delivery_seed_v1",
  "event_date": "2024-01-01"
}
```

## 재생성 방법

입력 파일:

```bash
data/external/nyc-taxi/yellow_tripdata_2024-01.parquet
```

생성 명령:

```bash
PYTHONPATH=/tmp/asklake_pyarrow_runtime \
  /Users/tail1/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  scripts/week2_m1_delivery_seed.py --limit 100000
```

주의: repo에는 이미 `backend/requirements.txt`에 `pyarrow==18.1.0`이 있다. local desktop 기본 Python에는 해당 dependency가 없어서, 이 실행에서는 임시 target `/tmp/asklake_pyarrow_runtime`에 `pyarrow 24.0.0`을 설치해 생성했다. 정식 재생성 환경에서는 backend requirements 설치 환경을 쓰면 된다.

## 검증 결과

- focused unittest: `python3 -m unittest tests/test_week2_m1_delivery_seed.py` passed, 5 tests.
- JSONL validation: 100,000 rows, required fields present.
- `is_synthetic_source=true`: all rows.
- `late_minutes`: all present.
- `late_delivery_flag`: all boolean.
- `is_late_60`: all boolean.
- `source_taxi_row_hash`: all present.
- event date filter: all rows are within January 2024.
- Parquet copy read validation: 100,000 rows.
- metadata JSON validation: passed.
- harness: `scripts/validate-harness.sh --strict` passed.

## Caveat

- 실제 배송 데이터가 아니다.
- Taxi trip을 delivery record로 변환한 synthetic auxiliary dataset이다.
- 발표/demo main path는 Amazon Reviews `amazon_reviews_json`을 유지한다.
- 이 seed를 M3에 태우는 경우에도 `synthetic_auxiliary_source`로 분리해야 한다.
- `delivery_trips_seed.parquet`은 convenience copy이며 canonical handoff는 JSONL이다.

## M5/M6에 요청할 확인 사항

1. 이 shape로 late delivery, cost/distance, product-level delivery analysis를 시작할 수 있는지 확인한다.
2. `late_threshold_minutes=60`, `late_minutes`, `is_late_60` 기준이 분석에 충분한지 확인한다.
3. Parquet copy가 필요한지, JSONL만으로 충분한지 결정한다.
4. `duckdb`는 M6 SQL adapter Phase에서 `SqlEngineAdapter` 뒤에 붙일 때 추가할지 판단한다.
