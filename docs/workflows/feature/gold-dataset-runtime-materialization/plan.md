# Gold dataset runtime materialization 계획

## 목표

Gold Dataset 생성을 Silver Dataset 입력으로 제한하고, 여러 Silver Dataset을 recipe로 결합해 local output과 MinIO object upload evidence를 남긴다.

## 상태

- 2026-06-30: 계획 생성. Gold는 prepared/local materialization 경계가 있으나, runtime MinIO write와 Silver-only input 경계를 다시 검증해야 한다.
- 2026-06-30: 구현 완료. prepared Gold가 없으면 materialized Silver parquet 입력으로 Gold parquet를 생성하고, object storage는 `not_uploaded` evidence로 분리한다.

## 범위

- Gold wizard 입력을 Silver Dataset으로 제한.
- 여러 Silver Dataset 선택.
- join/aggregate/score recipe 실행.
- local output path와 MinIO/S3-compatible object URI 기록.
- Catalog 등록 전 상태와 등록 가능 상태 구분.

## 제외 범위

- AWS S3 production profile.
- Spark direct S3A write.
- Catalog publish와 AI Query 실행.
- Airflow DAG 내부 Spark 호출.

## 선행 조건

- Silver Dataset runtime materialization.
- MinIO local runtime.
- M2 storage adapter/upload smoke.

## 구현 대상 파일 예상

- `backend/app/services/target_dataset_local_runner.py`
- `backend/app/services/week2_storage_adapter.py`
- `backend/app/api/source_catalog.py`
- `frontend/src/app/App.jsx`
- backend tests for local + MinIO output evidence

## Acceptance Criteria

- [x] Gold 생성 입력은 Silver Dataset만 선택된다.
- [x] recipe 실행 결과가 local parquet file로 생성된다.
- [x] MinIO upload 미설정 상태가 local materialization 성공과 분리되어 `not_uploaded` evidence로 남는다.
- [x] run record에 local path, expected object URI, row count, bytes가 기록된다.

## Regression / Failure Scenario

- Source Dataset을 Gold 입력으로 직접 선택하면 실패다.
- MinIO upload 실패를 local materialization 성공과 혼동하면 실패다.
- object storage credential value가 response/log에 남으면 실패다.

## Manual Verification

1. Silver Dataset 여러 개를 선택한다.
2. Gold recipe를 실행한다.
3. local output과 MinIO object를 확인한다.
4. Catalog 등록 전 상태를 확인한다.

## Report 기준

- `docs/reports/gold-dataset-runtime-materialization.md`에 local/S3-compatible output evidence를 기록한다.
