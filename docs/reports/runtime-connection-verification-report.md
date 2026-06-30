# Runtime connection verification report

## Type

- Phase: C-23
- Branch/workspace: `feature/runtime-connection-verification-report`
- Date: 2026-06-30

## Summary

Kafka, Airflow, Spark, MinIO, PostgreSQL, MongoDB local runtime은 기동과 CLI smoke 기준으로 확인됐다. AskLake UI/API는 아직 모든 런타임을 직접 connector 기능으로 사용하지 않으므로, 이 보고서는 `가능`, `readiness only`, `blocked by API/runtime implementation`을 분리해 다음 Phase의 구현 범위를 고정한다.

## Changed

- `docs/workflows/feature/runtime-connection-verification-report/plan.md` 상태를 완료로 갱신했다.
- `docs/workflows/feature/runtime-connection-verification-report/quality.md`에 검증 결과를 기록했다.
- `docs/workflows/feature/runtime-connection-verification-report/report.md`와 `notes.md`를 추가했다.
- `docs/reports/README.md` Latest Report Index에 본 report를 추가했다.

## Verification

| Runtime/API | 결과 | Evidence |
| --- | --- | --- |
| Docker runtime | 성공 | Kafka, Airflow, Spark, MinIO, PostgreSQL, MongoDB 컨테이너 기동 |
| HTTP health | 성공 | backend `18000`, frontend `5173`, Kafka UI, Airflow health, Spark UI, MinIO health 모두 `200` |
| Kafka CLI smoke | 성공 | topic produce/consume 성공, 1 message 처리 |
| Airflow trigger | 성공 | `asklake_week2_reviews` DAG run `success`, result artifact 생성 |
| Spark cluster smoke | 성공 | standalone master/worker에서 `SparkPi` job 성공 |
| MinIO smoke | 성공 | bucket object write/read 성공 |
| PostgreSQL smoke | 성공 | local demo table write/read 성공 |
| MongoDB smoke | 성공 | local demo collection write/read 성공 |
| AskLake local file inspect | 성공 | sample JSONL schema discovery 성공 |
| AskLake Airflow readiness | 성공 | `configured`, `trigger_available=true`, `credential_values_exposed=false` |
| AskLake Spark readiness | 부분 성공 | `local_smoke_ready`, `cluster_configured=true`, `distributed_cluster_available=false` |
| AskLake Kafka replay evidence | readiness only | `missing_evidence`, `sent_rows=0`, `error_count=0` |
| AskLake DB/S3/Kafka inspect | blocked | `postgres`, `mongodb`, `s3`, `kafka` connector inspect는 현재 C-14 discovery 대상이 아니라 `400` |

## Boundary

- 컨테이너가 떠 있고 CLI smoke가 성공했다는 사실은 AskLake connector runtime 구현 완료를 의미하지 않는다.
- Airflow는 trigger evidence가 있지만 `/runs` UI runtime panel은 현재 복구 대상이다.
- Spark cluster는 CLI job evidence가 있지만 AskLake API는 아직 distributed cluster job 실행을 지원하지 않는다.
- DB/S3/Kafka는 local runtime smoke가 가능하지만 AskLake External Connection inspect/test API는 후속 Phase에서 구현해야 한다.
- secret value는 문서에 기록하지 않았다. local demo credential은 local-only evidence로 취급한다.

## Acceptance Check

- 각 runtime별 URL, smoke 결과, credential 기록 경계를 문서화했다.
- AskLake API가 `local_file/local_folder` 외 connector inspect를 차단하는 현재 상태를 기록했다.
- 후속 Phase가 구현해야 할 gap을 C-24 이후 항목으로 분리했다.

## Regression / Failure Scenario Check

- 컨테이너 기동을 connector runtime 완료로 오해하지 않도록 report boundary에 명시했다.
- Airflow/Spark readiness와 실제 trigger/job evidence를 별도로 기록했다.
- secret value를 남기지 않았다.

## Next

1. C-24 `feature/runs-runtime-panel-restore`: `/runs` runtime panel 복구.
2. C-25 `feature/external-connection-runtime-checks`: DB/S3/Kafka connection test API.
3. C-26~C-31: Source/Silver/Gold/Jobs/Catalog/AI Query runtime E2E 연결.
