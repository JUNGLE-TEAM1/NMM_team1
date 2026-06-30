# Taxi PostgreSQL Source Dataset 등록 notes

- 2026-06-30: 사용자가 인증/연결 테스트는 후순위로 미루고, 로컬 Taxi PostgreSQL table을 실제 Source Dataset으로 등록하는 흐름을 요청했다.
- 2026-06-30: 사이드 챗 변경으로 저장 전 `Test Connection` UI/API가 추가되어 이번 slice에 schema preview smoke까지 포함한다. production credential vault와 상태 persistence는 여전히 후속이다.
- Docker container `asklake-taxi-postgres`를 `localhost:55432`로 실행했다.
- 1차 smoke는 `yellow_tripdata_2026_partial/yellow_tripdata_2026-01.parquet` 하나로 제한했다.
- `source_file`, `service_year_month`는 사용자 승인 전까지 table schema에 넣지 않는다.
