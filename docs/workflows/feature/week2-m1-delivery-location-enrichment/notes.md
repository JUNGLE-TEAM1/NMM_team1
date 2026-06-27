# Week2 M1 delivery location enrichment 노트

## 진행 메모

- 2026-06-27: PR #180 merge 이후 M5 피드백을 반영해 location enrichment follow-up Phase를 시작했다.
- 2026-06-27: 최신 `origin/main` `a14b760` 기준 worktree `/Users/tail1/Documents/nmm-week2-m1-delivery-location-enrichment`를 생성했다.
- 2026-06-27: 이전 worktree의 ignored Taxi Parquet 원본을 새 worktree `data/external/nyc-taxi/yellow_tripdata_2024-01.parquet`로 복사했다.
- 2026-06-27: TLC Taxi Zone lookup CSV를 `data/external/nyc-taxi/taxi_zone_lookup.csv`로 다운로드했다.
- 2026-06-27: generator가 `PULocationID`, `DOLocationID`를 `source_pickup_location_id`, `source_dropoff_location_id`로 보존하도록 변경했다.
- 2026-06-27: lookup 기반 `pickup_borough`, `pickup_zone`, `dropoff_borough`, `dropoff_zone` enrichment를 추가했다.
- 2026-06-27: generated JSONL/Parquet를 100,000행으로 재생성했고 pickup/dropoff zone present rate가 각각 1.0임을 확인했다.

## 결정

- delivery seed는 계속 `M5/M6 auxiliary synthetic dataset, not M3 main raw`로 유지한다.
- canonical은 `delivery_trips_seed.jsonl`, Parquet은 convenience copy로 유지한다.
- generated `data/`는 commit하지 않는다.

## 열린 질문

- M5/M6가 enriched location fields를 실제 분석 query에 연결하는 것은 후속 소비 Phase에서 진행한다.

## 링크 / 증거

- Taxi source: `data/external/nyc-taxi/yellow_tripdata_2024-01.parquet`
- Taxi source SHA-256: `c4d59da7bbc8abaeeeb1727947ee93d9891a71acb42854bd80db1571b2030510`
- Taxi Zone lookup URL: `https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv`
- Taxi Zone lookup SHA-256: `1a99e105092230f8620f301edcca7f80d3080642ff404d28ed957d3fa222c8ed`
- Generated JSONL: `data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.jsonl`
- Generated Parquet: `data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.parquet`
