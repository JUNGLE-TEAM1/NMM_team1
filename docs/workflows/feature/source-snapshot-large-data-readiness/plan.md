# Source Snapshot large data readiness 계획

## 목표

C-26C에서 추가된 Source Snapshot을 대용량 데모 관점에서 오해 없이 보이게 한다. 현재 snapshot은 full ingest가 아니라 bounded sample evidence이므로, API/UI/문서가 이 경계를 명확히 표시해야 한다.

## 범위

- Source Snapshot 응답에 bounded sample metadata를 추가한다.
- Source Dataset 상세 UI에서 snapshot coverage와 input/output bytes 의미를 표시한다.
- `docs/03`, `docs/05`, `docs/06`, `docs/07`, `docs/08`에 C-36 경계를 반영한다.

## 제외 범위

- 5GB full ingest runner.
- Spark/Airflow 실행.
- retry/backfill.
- DB/S3/Kafka continuous ingest.
- Product Health Gold 재생성 또는 Catalog publish.

## Acceptance Criteria

- Snapshot 응답이 `snapshot_mode=bounded_sample`, `requested_sample_size`, `coverage_status`, `large_data_status`를 포함한다.
- UI가 snapshot row/output bytes를 full ingest evidence처럼 표시하지 않는다.
- 기존 Source Dataset snapshot API와 Silver materialization 경로가 깨지지 않는다.

## Regression / Failure Scenario

- `row_count=100`이 전체 ingest 완료처럼 보이면 실패다.
- snapshot output bytes를 Product Health 5GB input 처리 증거로 보이면 실패다.
- 기존 snapshot 생성/list API가 실패하면 실패다.

## Manual Verification

1. backend focused test를 실행한다.
2. frontend build를 실행한다.
3. Source Dataset 상세 snapshot panel이 bounded coverage를 표시하는지 코드와 문서 기준으로 확인한다.
