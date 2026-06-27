# Week2 M1 delivery location enrichment handoff

## 전달 대상

- M5/M6 분석 보조 데이터 소비자
- delivery seed 후속 소비 Phase 작성자

## 한 줄 요약

PR #180의 delivery synthetic auxiliary seed에 Taxi 원본 pickup/dropoff location ID와 TLC Taxi Zone borough/zone 이름을 추가했다. 이 데이터는 여전히 실제 배송 원천이 아니며, M3 main raw가 아니라 M5/M6 분석 보조 synthetic dataset이다.

## 추가 필드

이번 follow-up으로 모든 row에 아래 필드가 추가된다.

```json
{
  "source_pickup_location_id": 186,
  "source_dropoff_location_id": 79,
  "pickup_borough": "Manhattan",
  "pickup_zone": "Penn Station/Madison Sq West",
  "dropoff_borough": "Manhattan",
  "dropoff_zone": "East Village"
}
```

## Lineage

- Taxi source: `data/external/nyc-taxi/yellow_tripdata_2024-01.parquet`
- Taxi source SHA-256: `c4d59da7bbc8abaeeeb1727947ee93d9891a71acb42854bd80db1571b2030510`
- Taxi Zone lookup: `data/external/nyc-taxi/taxi_zone_lookup.csv`
- Taxi Zone lookup SHA-256: `1a99e105092230f8620f301edcca7f80d3080642ff404d28ed957d3fa222c8ed`
- Lookup URL: `https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv`

## 검증 결과

- focused unittest: `python3 -m unittest tests/test_week2_m1_delivery_seed.py` passed, 7 tests.
- generated JSONL: 100,000 rows.
- generated Parquet copy: 100,000 rows.
- `source_pickup_location_id`: all rows present.
- `source_dropoff_location_id`: all rows present.
- `pickup_zone_present_rate`: 1.0.
- `dropoff_zone_present_rate`: 1.0.
- metadata JSON validation: passed.

## M5/M6 사용 가능 분석

- pickup borough/zone별 average duration, late rate.
- dropoff borough/zone별 average cost, late rate.
- pickup/dropoff route pair별 distance/cost aggregation.
- airport, Manhattan core 등 zone-group demo query.

## Caveat

- borough/zone은 Taxi Zone lookup 기반 source geography다.
- 실제 delivery operations geography로 해석하면 안 된다.
- product-level 차이는 synthetic assignment이므로 실제 상품 영향으로 해석하면 안 된다.
- canonical handoff는 JSONL이고 Parquet은 Spark/M5/M6 convenience copy다.
