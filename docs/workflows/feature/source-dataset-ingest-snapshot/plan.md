# Source dataset ingest snapshot 계획

## 목표

Source Dataset metadata 생성 이후 실제 row/object/message를 raw snapshot으로 materialize하고 evidence를 남긴다.

## 상태

- 2026-06-30: 계획 생성. C-26B는 schema/sample discovery까지만 닫았고, 실제 데이터 ingest/snapshot은 분리한다.
- 2026-06-30: 구현 완료. Source Dataset 상세에서 `Raw snapshot 생성` 액션을 추가했고, bounded snapshot evidence를 `source_dataset_snapshots`에 저장한다.

## 범위

- Source Dataset detail 또는 Jobs에서 `Snapshot 생성` / `Raw ingest 실행` 액션 추가.
- Local file/folder: bounded copy 또는 manifest 생성.
- PostgreSQL/MongoDB: secret_ref/options를 다시 받은 bounded schema/sample read 기반 raw snapshot 저장 경로 추가.
- S3: secret_ref/options를 다시 받은 bounded object sample snapshot 저장 경로 추가.
- Kafka: secret_ref/options를 다시 받은 bounded topic sample snapshot 저장 경로 추가.
- evidence: row count, bytes, input scope, output path, duration, status.

## 제외 범위

- Silver/Gold 변환.
- unbounded full Kafka consume.
- production scheduler/retry/backfill.
- distributed Spark execution.

## Acceptance Criteria

- [x] Source Dataset 생성과 ingest/snapshot 실행이 UI에서 분리되어 보인다.
- [x] snapshot 성공 시 output path, bytes, row count evidence가 남는다.
- [x] 실패 시 metadata만 성공으로 보이지 않는다.

## 다음 Phase

- C-27 `feature/silver-dataset-runtime-materialization`: snapshot 또는 source metadata를 입력으로 Silver output을 생성한다.
