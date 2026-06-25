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

## 데이터 규모 전략

| 단계 | 목적 | 후보 규모 | 사용 방식 |
| --- | --- | --- | --- |
| `demo` | UI/smoke/E2E 연결 확인 | 1,000~10,000 rows | 빠르게 반복 실행하고 실패 원인을 좁힌다. |
| `fixed` | PR/리뷰/검산 반복 기준 | 100,000~500,000 rows 또는 고정 date range | 같은 입력에서 같은 row count와 Gold 결과가 나오는지 확인한다. |
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

## 결정

- `demo -> fixed -> local-full-month -> scale-target` 단계 확장 전략을 사용한다.
- `yellow_tripdata_2024-01.parquet`는 로컬 full-month 검증 기준으로 사용하고, 전체 택시 데이터 적재 목표는 후속 `scale-target` 범위로 분리한다.
- 첫 구현은 Spark를 필수로 요구하지 않고, Spark 전환이 가능한 runner 경계를 유지한다.
- Airflow DAG 구현은 M5 책임으로 두고, M2는 Airflow/local runner가 호출 가능한 Batch 처리 단위를 제공한다.

## 열린 질문

- `demo`, `fixed`의 정확한 row 수와 date range를 `yellow_tripdata_2024-01.parquet` 안에서 어디까지 고정할지.
- PostgreSQL 적재 스크립트를 M2가 소유할지, M1/M5의 local dev setup과 분리할지.
- Bronze/Gold Parquet의 MinIO bucket/prefix 규칙을 M5와 어떻게 맞출지.
- `local-full-month` 실행을 PR 필수 검증으로 둘지, manual/benchmark evidence로만 둘지.
- `scale-target`에서 Spark를 언제 도입할지, 또는 local runner 성능 한계 확인 후 도입할지.

## 링크 / 증거

- NYC TLC Trip Record Data: `https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page`
- 관련 계획: `docs/project-context/asklake-week2-module-plan/plan.md`
- 관련 결정: `docs/project-context/asklake-week2-module-plan/decisions.md`
- 관련 계약: `contracts/execution_result.sample.json`, `contracts/catalog_metadata.sample.json`, `contracts/workflow_definition.sample.json`
