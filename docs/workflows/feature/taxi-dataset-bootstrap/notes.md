# M2 taxi dataset bootstrap 노트

## 진행 메모

- M2의 목표는 단순 샘플 처리가 아니라 정형 Batch가 대용량 데이터 처리 증거를 남길 수 있음을 보여주는 것이다.
- 첫 구현은 큰 데이터 전체를 처음부터 묶지 않고 `demo -> fixed -> local-full-month -> scale-target` 단계로 확장한다.
- NYC TLC Taxi 데이터는 월별 Parquet을 기준 후보로 둔다.
  - 기본 후보: Yellow Taxi monthly Parquet
  - 권장 시작점: `yellow_tripdata_2024-01.parquet`
  - 이유: 2025년부터 일부 dataset에 `cbd_congestion_fee` 컬럼이 추가되어 schema drift가 생길 수 있으므로, 첫 안정화는 2024년 데이터가 유리하다.
- 로컬에서 확인한 `yellow_tripdata_2024-01.parquet`는 약 48MB, 2,964,624 rows, 3 row groups이다.
- 원본 Parquet, PostgreSQL volume, MinIO object, 생성된 Bronze/Gold Parquet은 repository에 commit하지 않는다.
- 이 branch에서는 데이터 다운로드나 batch 구현을 하지 않고, 데이터 범위와 실행 전략을 고정한다.
- GitHub issue `#78`은 사람이 다시 reopen했다. PR merge 전까지 기대 상태는 issue `Open`, GitHub Project `In Progress`다.

## 데이터 규모 전략

| 단계 | 목적 | 후보 규모 | 사용 방식 |
| --- | --- | --- | --- |
| `demo` | UI/smoke/E2E 연결 확인 | 10,000 rows | 빠르게 반복 실행하고 실패 원인을 좁힌다. |
| `fixed` | PR/리뷰/검산 반복 기준 | `pickup_date = 2024-01-01` | 같은 입력에서 같은 row count와 Gold 결과가 나오는지 확인한다. |
| `local-full-month` | 로컬 처리 규모 smoke/benchmark | `yellow_tripdata_2024-01.parquet` 전체, 약 2,964,624 rows / 48MB | 한 달 파일 전체를 같은 처리 경로로 돌리고 row count, bytes, duration, output path를 증거로 남긴다. |
| `scale-target` | 전체 택시 데이터 또는 GB/TB급 처리 목표 | multi-month, year 단위, 또는 전체 TLC Taxi dataset | 후속 branch에서 distributed 처리 필요성, Spark 도입, storage/partition 전략을 검증한다. |

전략은 작은 데이터만 처리하는 것이 아니라, 같은 처리 경로를 작은 입력으로 먼저 안정화한 뒤 큰 입력으로 확장하는 것이다.
`local-full-month`는 CI 필수 경로가 아니라 manual/benchmark evidence로 다룬다.
이 단계는 "GB/TB급 ETL 가능"을 증명하는 단계가 아니라, M2 batch path가 실제 월별 Parquet 전체를 끝까지 처리할 수 있는지 확인하는 로컬 기준이다.
`scale-target`은 별도 설계와 검증이 필요한 후속 범위로 남긴다.

## 실행 엔진 전략

- Spark는 대용량 분산 처리 엔진이지만 M2 첫 구현의 필수 조건은 아니다.
- Airflow는 스케줄링/오케스트레이션 도구이며, Spark와 역할이 다르다.
- 현재 분업 기준에서 Airflow, `WorkflowDefinition`, fallback runner, Status/Log/Retry 표준화는 M5 책임이다.
- M2는 Airflow DAG를 직접 소유하지 않고, Airflow 또는 local runner가 호출할 수 있는 Batch 처리 단위를 제공한다.

M2가 지켜야 할 경계:

```text
run_taxi_batch(config) -> ExecutionResult
```

초기 구현체는 Python 기반 batch runner여도 된다.
단, pandas/pyarrow/polars/spark 같은 내부 처리 엔진의 DataFrame 객체를 M1/M5/M6에 노출하지 않는다.
외부 모듈은 항상 `ExecutionResult`, `CatalogMetadata`, Parquet output path 같은 계약만 소비해야 한다.

나중에 Spark가 필요해지는 조건:

- `local-full-month` 또는 후속 `scale-target` 범위에서 단일 프로세스 처리 시간이 데모/리뷰 기준을 반복적으로 넘는다.
- join, group by, partitioned write 같은 작업이 local runner 메모리 한계를 넘는다.
- 발표 또는 리뷰에서 분산 처리 자체가 필수 증거로 요구된다.
- Airflow task가 단일 Python batch 대신 Spark submit을 호출해야 할 정도로 처리량 목표가 커진다.

Spark 전환 비용을 줄이는 방법:

- source 읽기, transform, write, metric 수집을 하나의 runner interface 뒤에 둔다.
- output은 항상 Bronze/Gold Parquet과 `ExecutionResult`/`CatalogMetadata`로 표준화한다.
- SQL/AI/Catalog 쪽이 내부 처리 엔진을 알지 못하게 한다.
- 첫 구현에서도 row count, bytes, duration, output path를 반드시 수집한다.

## NYC Taxi 데이터 사용 흐름

```text
NYC TLC Yellow Taxi monthly Parquet
-> local raw data path 또는 gitignore된 data path
-> PostgreSQL taxi_trips table 적재
-> M2 Taxi Batch가 PostgreSQL에서 읽음
-> Bronze Parquet 작성
-> Gold Parquet 작성
-> ExecutionResult 생성
-> CatalogMetadata 생성 또는 M5 Catalog 등록에 전달
-> M1 UI, M5 Workflow/Catalog, M6 SQL/RAG가 소비
```

첫 데이터 후보는 공식 TLC 월별 Yellow Taxi Parquet 중 `yellow_tripdata_2024-01.parquet`로 둔다.
이 파일은 로컬 기준 dataset이며, 전체 Taxi dataset 적재 목표를 대체하지 않는다.
정확한 `demo`/`fixed` date range와 row 수는 이 파일 안에서 잘라 정하고, multi-month/year 단위 확장은 후속 `scale-target` branch에서 다룬다.

### 로컬 dev용 loader의 의미

M2는 다음 구현 branch에서 `yellow_tripdata_2024-01.parquet`를 PostgreSQL `public.taxi_trips` table로 넣는 로컬 dev용 loader를 소유한다.
이 loader는 운영용 ingest 시스템이 아니라, M2 batch를 로컬에서 반복 검증하기 위한 준비 스크립트다.

쉽게 말하면 다음 일을 한다.

1. 원본 Parquet 파일은 repository에 commit하지 않고, `data/raw/taxi/yellow_tripdata_2024-01.parquet` 같은 gitignore된 경로에 둔다.
2. loader는 Parquet path와 `ASKLAKE_DEMO_POSTGRES_DSN`을 입력으로 받아 PostgreSQL에 접속한다.
3. `public.taxi_trips` table을 만들거나 비우고, Parquet row를 다시 적재한다.
4. 같은 명령을 여러 번 실행해도 중복 row가 계속 쌓이지 않게 한다. 이 의미가 idempotent다.
5. 적재 후 row count와 input bytes를 출력해 M2 batch 검증 증거로 쓴다.

첫 구현에서는 `replace/load` 전략을 기본으로 둔다.
즉, 개발 중에는 table을 새로 맞춘 뒤 다시 넣어서 항상 같은 입력 상태를 만든다.
파일 업로드 UI, 다중 tenant ingest, 증분 적재, 운영 retry/monitoring은 이 loader 범위가 아니다.
File source는 후속 확장으로 남기되, M2 batch 내부 경계는 `SourceConfig.connection_ref.kind`를 통해 `postgres_table`과 future `local_file_or_minio_object`가 분리될 수 있게 둔다.

## M2 Taxi 계약 mapping 초안

기존 `contracts/*.sample.json`은 Amazon Reviews 예시이므로 덮어쓰지 않는다.
M2는 같은 계약 구조를 따라 아래 Taxi 전용 값을 채운다.

### `SourceConfig`

| Field | M2 Taxi 값 | 설명 |
| --- | --- | --- |
| `tenant_id` | `tenant_demo` | demo tenant 기준 |
| `source_id` | `source_taxi_yellow_2024_01` | 2024년 1월 Yellow Taxi 로컬 기준 source |
| `source_type` | `postgres_taxi` | M2 batch가 읽는 안정 계약은 PostgreSQL table 기준 |
| `name` | `NYC TLC Yellow Taxi 2024-01` | UI/Catalog 표시 이름 |
| `connection_ref.kind` | `postgres_table` | 원본 Parquet 자체가 아니라 적재된 table을 batch 입력으로 본다. |
| `connection_ref.secret_ref` | `ASKLAKE_DEMO_POSTGRES_DSN` 또는 M1/M5가 정한 local secret ref | 실제 credential 값은 commit하지 않는다. |
| `connection_ref.path` | `public.taxi_trips` | PostgreSQL schema/table 후보 |
| `options.source_file_name` | `yellow_tripdata_2024-01.parquet` | local bootstrap 원본 파일명 |
| `options.future_file_source_supported` | `true` | 첫 구현은 PostgreSQL 우선이지만 File source 확장을 막지 않는다. |
| `options.event_time_column` | `tpep_pickup_datetime` | daily aggregation과 freshness 기준 |
| `options.sample_profile` | `demo`, `fixed`, `local-full-month` | 실행 범위 선택값 |

`/Users/liamtsy/Downloads/yellow_tripdata_2024-01.parquet`는 현재 로컬 확인 파일 경로일 뿐 계약에 박는 portable path가 아니다.
구현 branch에서는 repo 밖 또는 gitignore된 `data/raw/taxi/yellow_tripdata_2024-01.parquet` 같은 경로를 사용한다.

### `WorkflowDefinition`

| Node ID | Type | 입력 | 출력 | M2 의미 |
| --- | --- | --- | --- | --- |
| `node_source_taxi` | `Source` | `source_taxi_yellow_2024_01` | `artifact_taxi_trips_raw` | `taxi_trips`에서 원천 row를 읽는다. |
| `node_normalize_taxi` | `Cast/Normalize` | `artifact_taxi_trips_raw` | `artifact_taxi_trips_bronze` | 시간/숫자 타입과 품질 플래그를 정규화한다. |
| `node_aggregate_taxi_daily` | `Aggregate` | `artifact_taxi_trips_bronze` | `artifact_taxi_daily_metrics_gold` | `pickup_date` 기준 Gold metric을 만든다. |
| `node_load_taxi_daily_metrics` | `Load` | `artifact_taxi_daily_metrics_gold` | `dataset_taxi_daily_metrics_gold` | Gold Parquet을 저장하고 Catalog 등록 대상으로 넘긴다. |

Workflow 후보 값:

| Field | M2 Taxi 값 |
| --- | --- |
| `pipeline_id` | `pipeline_taxi_daily_metrics` |
| `name` | `NYC Taxi Daily Metrics` |
| `target_dataset` | `dataset_taxi_daily_metrics_gold` |
| `runner.primary` | `airflow` |
| `runner.fallback` | `local_runner` |
| `retry.max_attempts` | `2` |

M2는 Airflow DAG 자체를 소유하지 않는다.
M2가 제공할 단위는 M5 runner가 호출할 수 있는 `run_taxi_batch(config) -> ExecutionResult` 형태다.

### `ExecutionResult`

| Field | M2 Taxi 값 | 설명 |
| --- | --- | --- |
| `run_id` | `run_taxi_2024_01_<profile>_<timestamp>` | 실행 단위 식별자 |
| `pipeline_id` | `pipeline_taxi_daily_metrics` | WorkflowDefinition과 연결 |
| `executor` | `airflow` 또는 `local_runner` | 실제 실행자 |
| `fallback_compatible_executor` | `local_runner` | Airflow 실패 시 local fallback 가능 |
| `status` | `succeeded`, `failed`, `fallback_succeeded`, `fallback_failed` | 기존 status model 사용 |
| `row_count` | 처리한 input trip row 수 | `local-full-month` 기준 후보는 2,964,624 rows |
| `bytes` | 읽은 input bytes 또는 주요 output bytes | 최소 input bytes와 Gold output bytes 중 무엇을 표준으로 둘지 M5와 확인 필요 |
| `outputs[].dataset_id` | `dataset_taxi_daily_metrics_gold` | Gold 결과 dataset |
| `outputs[].layer` | `gold` | Catalog layer |
| `outputs[].uri` | `s3://asklake-demo/taxi/gold/daily_metrics/run_id=<run_id>/` | MinIO/S3 후보 URI |
| `task_results[].node_id` | workflow node id와 동일 | node별 row count, bytes, error 기록 |
| `lineage.source_ids` | `["source_taxi_yellow_2024_01"]` | source 추적 |
| `lineage.output_datasets` | `["dataset_taxi_daily_metrics_gold"]` | Gold dataset 추적 |

`ExecutionResult.row_count`는 M2 기준으로 "처리한 input trip row 수"로 둔다.
Gold output row 수는 `CatalogMetadata.metrics.row_count`와 `node_load_taxi_daily_metrics.row_count`에 남긴다.
M5의 run status 모델이 나중에 다른 의미를 요구하면 implementation branch에서 adapter mapping으로 맞춘다.

M5 확인은 현재 PR의 blocking gate로 두지 않는다.
대신 M2 기본 가정을 아래처럼 둔다.

| 항목 | M2 기본 가정 | 후속 조정 조건 |
| --- | --- | --- |
| `ExecutionResult.row_count` | input trip row 수 | M5가 workflow 전체 row count 의미를 별도로 표준화할 때 |
| `ExecutionResult.bytes` | input bytes read | M5 확인 기준과 일치. |
| task-level `bytes` | node별 input/output bytes 중 구현 가능한 값 | local runner와 Airflow adapter metric schema가 정해질 때 |
| Gold output URI | `s3://asklake-demo/taxi/gold/daily_metrics/run_id=<run_id>/` | M5 Catalog/MinIO prefix 표준이 정해질 때 |
| local fallback path | `data/processed/taxi/gold/daily_metrics/run_id=<run_id>/` | M1/M5 local dev setup이 다른 data root를 정할 때 |

### `CatalogMetadata`

| Field | M2 Taxi 값 | 설명 |
| --- | --- | --- |
| `dataset_id` | `dataset_taxi_daily_metrics_gold` | Gold daily metrics dataset |
| `name` | `NYC Taxi Daily Metrics Gold` | Catalog 표시 이름 |
| `layer` | `gold` | 분석/AI 질의용 최종 산출물 |
| `s3_uri` | `s3://asklake-demo/taxi/gold/daily_metrics/run_id=<run_id>/` | MinIO/S3 후보 |
| `storage.bucket` | `asklake-demo` | M5와 최종 확정 필요 |
| `storage.prefix` | `taxi/gold/daily_metrics/run_id=<run_id>/` | partition/prefix 후보 |
| `storage.local_fallback_path` | `data/processed/taxi/gold/daily_metrics/run_id=<run_id>/` | MinIO 미사용 fallback 후보 |
| `query.table_name` | `gold_taxi_daily_metrics` | M6 SQL/RAG와 M1 UI가 조회할 논리 table |
| `freshness.event_time_column` | `pickup_date` | Gold freshness 기준 |

Gold schema 후보:

| Field | Type | 설명 |
| --- | --- | --- |
| `pickup_date` | `date` | `tpep_pickup_datetime`에서 만든 집계 기준일 |
| `trip_count` | `integer` | 일별 운행 건수 |
| `total_passenger_count` | `integer` | 일별 승객 수 합계 |
| `total_trip_distance` | `number` | 일별 이동거리 합계 |
| `avg_trip_distance` | `number` | 평균 이동거리 |
| `total_fare_amount` | `number` | 운임 합계 |
| `total_tip_amount` | `number` | 팁 합계 |
| `total_tolls_amount` | `number` | 통행료 합계 |
| `total_amount` | `number` | 총 결제 금액 합계 |
| `avg_total_amount` | `number` | 평균 결제 금액 |
| `avg_duration_minutes` | `number` | 평균 운행 시간 |
| `valid_trip_count` | `integer` | 품질 조건을 통과한 row 수 |
| `invalid_trip_count` | `integer` | 음수 거리/금액, 잘못된 시간 등 제외 또는 경고 대상 row 수 |

초기 valid trip 조건 후보:

- `tpep_pickup_datetime`와 `tpep_dropoff_datetime`가 존재한다.
- `tpep_dropoff_datetime >= tpep_pickup_datetime`이다.
- `trip_distance >= 0`이다.
- `total_amount >= 0`이다.

## 데이터셋 컬럼 확인

로컬 Parquet metadata 기준 확인 결과:

| Column | Type | M2 사용처 |
| --- | --- | --- |
| `VendorID` | `INT32` | source 품질/분류 |
| `tpep_pickup_datetime` | `TIMESTAMP_MICROS` | `pickup_date`, freshness, partition 기준 |
| `tpep_dropoff_datetime` | `TIMESTAMP_MICROS` | duration 계산 |
| `passenger_count` | `INT64` | `total_passenger_count` |
| `trip_distance` | `DOUBLE` | 거리 metric, valid trip 조건 |
| `RatecodeID` | `INT64` | 후속 ratecode별 분석 후보 |
| `store_and_fwd_flag` | `UTF8` | 품질/운영 flag 후보 |
| `PULocationID` | `INT32` | 후속 pickup zone 분석 후보 |
| `DOLocationID` | `INT32` | 후속 route 분석 후보 |
| `payment_type` | `INT64` | 후속 결제수단별 분석 후보 |
| `fare_amount` | `DOUBLE` | 운임 metric |
| `extra` | `DOUBLE` | 추가 요금 metric 후보 |
| `mta_tax` | `DOUBLE` | 세금 metric 후보 |
| `tip_amount` | `DOUBLE` | 팁 metric |
| `tolls_amount` | `DOUBLE` | 통행료 metric |
| `improvement_surcharge` | `DOUBLE` | 수수료 metric 후보 |
| `total_amount` | `DOUBLE` | 총액 metric, valid trip 조건 |
| `congestion_surcharge` | `DOUBLE` | 혼잡 요금 metric 후보 |
| `Airport_fee` | `DOUBLE` | 공항 요금 metric 후보 |

첫 Gold는 `gold_taxi_daily_metrics` 하나로 제한한다.
`payment_type`, `PULocationID`, `DOLocationID` 기반 Gold는 후속 구현 또는 scale-target에서 확장한다.

## 결정

- `demo -> fixed -> local-full-month -> scale-target` 단계 확장 전략을 사용한다.
- `yellow_tripdata_2024-01.parquet`는 로컬 full-month 검증 기준으로 사용하고, 전체 택시 데이터 적재 목표는 후속 `scale-target` 범위로 분리한다.
- `demo`는 10,000 rows로 둔다.
- `fixed`는 `pickup_date = 2024-01-01`로 둔다.
- PostgreSQL table 후보는 `taxi_trips`로 둔다.
- 첫 Gold dataset은 `gold_taxi_daily_metrics`로 둔다.
- M5의 공통 계약 구조는 `docs/03-interface-reference.md`와 `contracts/*.sample.json`을 따른다. Taxi 전용 공식 예시는 다음 구현 branch에서 코드와 함께 승격한다.
- 첫 구현은 Spark를 필수로 요구하지 않고, Spark 전환이 가능한 runner 경계를 유지한다.
- Airflow DAG 구현은 M5 책임으로 두고, M2는 Airflow/local runner가 호출 가능한 Batch 처리 단위를 제공한다.
- M2는 로컬 dev용 Parquet -> PostgreSQL loader를 소유하고, M2 batch의 우선 입력은 `public.taxi_trips`로 둔다.
- File source는 후속 확장으로 남기되, 첫 구현 구조에서 막지 않는다.
- 첫 Gold output은 local Parquet path를 우선 사용하고, `s3_uri`와 MinIO/S3 prefix는 같은 계약 필드로 전환 가능하게 유지한다.
- 오늘~내일 구현 검증은 `fixed=pickup_date 2024-01-01`을 필수 기준으로 두고, `local-full-month`는 manual/benchmark evidence로 남긴다.

## 열린 질문

- Bronze/Gold Parquet의 최종 MinIO bucket/prefix 규칙을 M5와 어떻게 맞출지.
- `scale-target`에서 Spark를 언제 도입할지, 또는 local runner 성능 한계 확인 후 도입할지.
- 일주일 안에 multi-month/year 또는 전체 Taxi dataset 적재 목표를 어느 수준의 증거로 보여줄지.
- Taxi 전용 `SourceConfig`, `WorkflowDefinition`, `ExecutionResult`, `CatalogMetadata` 예시를 `docs/03-interface-reference.md`와 `contracts/`에 어느 branch에서 공식 반영할지.

## 링크 / 증거

- NYC TLC Trip Record Data: `https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page`
- 관련 계획: `docs/project-context/asklake-week2-module-plan/plan.md`
- 관련 결정: `docs/project-context/asklake-week2-module-plan/decisions.md`
- 관련 계약: `contracts/source_config.sample.json`, `contracts/workflow_definition.sample.json`, `contracts/execution_result.sample.json`, `contracts/catalog_metadata.sample.json`
