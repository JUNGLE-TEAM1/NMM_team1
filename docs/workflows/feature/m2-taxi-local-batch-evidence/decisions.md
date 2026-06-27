# M2 Taxi local batch evidence 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 신규 고영향 선택은 열지 않는다. `taxi-dataset-bootstrap`에서 이미 확정한 데이터셋/Gold metric 방향을 구현한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 첫 구현 입력 | local Taxi Parquet file 직접 처리 | PostgreSQL loader까지 넣으면 PR 범위가 커진다. 이번 PR은 처리 로직과 Gold output evidence를 먼저 닫는다. | 사용자 "그래 그렇게 하자" / 2026-06-27 |
| 첫 Gold output | `gold_taxi_daily_metrics.parquet` | 날짜별 운행 수, 거리, 금액, 유효/무효 row count가 SQL/AI follow-up에 쓰기 쉽다. | `taxi-dataset-bootstrap` 결정 승계 |
| 실행 엔진 | local pyarrow batch runner | Spark/S3 전환 전 같은 metric/output 경계를 빠르게 검증한다. | `taxi-dataset-bootstrap` 결정 승계 |
| 기간 밖 Taxi row 처리 | Raw/Bronze 원본은 보존하고, Gold에는 기대 월 필터를 적용하며, 제외 row는 품질 증거로 기록 | `yellow_tripdata_2024-01.parquet` 안에 1월 밖 pickup 날짜 18행이 섞여 있었다. 원본을 삭제하면 재현성이 깨지고, Gold에 그대로 넣으면 1월 결과가 35일로 보여 데모 설명이 어려워진다. | 사용자 후속 확인 / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| PostgreSQL `taxi_trips` loader | 이번 PR은 local evidence runner에 집중한다. DB dependency까지 넣으면 PR 1 범위를 넘는다. | local Parquet evidence merge 후 source connector/DB 입력 경로가 필요할 때 | M2 PostgreSQL loader follow-up |
| MinIO/S3 write | local output path 우선 전략을 따른다. | storage adapter phase 시작 시 | M2 storage adapter follow-up |
| PySpark runner | local pyarrow evidence 후 engine만 교체한다. | Spark 데모 요구 또는 local runner 한계가 확인될 때 | M2 PySpark local mode follow-up |
| Airflow DAG 내부 호출 | M5 orchestration 책임과 맞춰야 한다. | M5가 DAG task에서 M2 runner를 호출하는 integration phase | M2/M5 Airflow integration |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Taxi full-month output이 31일보다 많은 날짜를 만든다 | source 파일의 outlier timestamp를 확인한다 | 품질 metric 또는 date range filter를 후속 결정으로 추가 |
