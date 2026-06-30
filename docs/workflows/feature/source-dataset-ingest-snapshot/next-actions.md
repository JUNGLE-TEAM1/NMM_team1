# Source dataset ingest snapshot next actions

## 바로 다음

- C-27 `feature/silver-dataset-runtime-materialization` 진행.
- 최신 Source Snapshot 또는 Source Dataset raw scope를 입력으로 Silver output을 생성한다.

## 보류

- PostgreSQL/MongoDB/S3/Kafka full ingest UX는 secret_ref 재입력/보관 정책과 함께 후속 Phase에서 확장한다.
- production scheduler, retry, backfill은 이번 demo path 밖이다.
