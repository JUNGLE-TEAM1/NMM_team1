# Product Health 원천별 Source Dataset 연결 계획

## Status

- 2026-06-30: `Prepared Dataset` 묶음 연결 계획을 폐기하고 원천별 연결 -> Source Dataset 생성 검증으로 전환.

## 목표

Product Health 데모 원천을 하나의 bundle로 묶지 않고, 서로 다른 연결 종류/포맷을 가진 External Connection에서 개별 Source Dataset으로 생성되게 한다.

## 범위

- Source Dataset 생성 wizard에서 원천별 Source Dataset 이름을 자연스럽게 추천한다.
- 다음 canonical Source Dataset 이름을 사용한다.
  - Amazon Reviews JSONL -> `source_product_reviews`
  - MEP Product JSON -> `source_product_catalog`
  - Behavior Events JSONL -> `source_user_events`
  - Taxi Delivery Parquet -> `source_delivery_trip_logs`
- Source Dataset은 선택된 External Connection의 `resource`, `resource_label`, `schema_preview`를 그대로 상속한다.
- 실제 row ingest나 Silver/Gold 변환은 수행하지 않는다.

## 제외 범위

- `data/local_sources/product_health/raw` 전체 bundle 연결.
- Silver Dataset 생성.
- Gold Dataset 생성.
- Kafka consume/replay.
- Airflow/Spark 실행.
- DB/S3 credential 연결.

## 선행 조건

- External Connection local discovery에서 `Prepared Dataset` 옵션이 제거되어 있다.
- Amazon/MEP/Behavior/Taxi 원천 preset으로 External Connection을 저장할 수 있다.

## 구현 대상 파일 예상

- `frontend/src/app/App.jsx`
- focused backend/frontend tests 또는 브라우저 smoke

## API/contract 영향

- 새 API는 만들지 않는다.
- 기존 `SourceDatasetCreate` contract를 사용한다.
- `connection_type`은 `local_file`, `local_folder`, `kafka` 등 개별 connector type을 유지한다.

## UI 영향

- Source Dataset 생성 1단계에서 저장된 External Connection을 선택한다.
- 2단계의 Source Dataset 이름이 원천 의미에 맞게 자동 추천된다.
- Review에서 raw scope와 schema preview가 선택한 connection과 일치해야 한다.

## Acceptance Criteria

- Amazon Reviews connection 선택 시 `source_product_reviews`가 추천된다.
- MEP Product connection 선택 시 `source_product_catalog`가 추천된다.
- Behavior Events connection 선택 시 `source_user_events`가 추천된다.
- Taxi Delivery connection 선택 시 `source_delivery_trip_logs`가 추천된다.
- Source Dataset 저장 후 목록에 metadata가 나타난다.

## Regression / Failure Scenario

- Source Dataset이 연결 대신 기존 Source Dataset을 다시 고르는 구조로 돌아가지 않는다.
- 같은 Source Dataset 이름을 중복 저장하면 기존 duplicate guard가 동작한다.
- External Connection이 없으면 Source Dataset 생성이 차단된다.

## Manual Verification

1. External Connection에서 Amazon/MEP/Behavior/Taxi 원천 중 하나 이상을 저장한다.
2. Source Dataset 생성으로 이동해 connection을 선택한다.
3. 추천된 Source Dataset 이름과 raw scope를 확인한다.
4. 저장 후 Source Dataset 목록에서 상세 정보를 확인한다.

## Report 기준

- `docs/reports/product-health-source-dataset-link.md`에 생성한 Source Dataset, 검증한 원천, 남은 Silver/Gold 연결 범위를 기록한다.
