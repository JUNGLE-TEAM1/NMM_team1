# Runtime connection verification report 품질 기록

## Context Budget

- Mode: Lite Read
- 읽은 문서: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md` C-23 섹션, `docs/workflows/feature/runtime-connection-verification-report/plan.md`, `docs/reports/_template.md`, `docs/reports/README.md`

## 검증 요약

- 코드 변경 없음. C-23은 runtime evidence 문서화 Phase다.
- Docker runtime: Kafka, Airflow, Spark, MinIO, PostgreSQL, MongoDB 컨테이너 기동 확인.
- HTTP health: backend `18000`, frontend `5173`, Kafka UI `8084`, Airflow health `8080`, Spark UI `18080`, MinIO health `9000` 응답 확인.
- AskLake API readiness: Airflow configured, Spark local smoke ready, Kafka replay evidence missing 상태 확인.
- Connector inspect boundary: `postgres`, `mongodb`, `s3`, `kafka`는 현재 AskLake C-14 discovery 대상이 아니라 `400`으로 차단됨을 확인.

## Runtime Smoke Evidence

| Runtime | 결과 | 메모 |
| --- | --- | --- |
| Kafka | 성공 | `asklake-connection-smoke` topic produce/consume 성공, 1 message 처리 |
| Airflow | 성공 | `asklake_week2_reviews` DAG trigger 후 run `success`, result artifact 생성 |
| Spark | 성공 | standalone master/worker에서 `SparkPi` cluster job 성공 |
| MinIO | 성공 | `asklake-demo` bucket object write/read 성공 |
| PostgreSQL | 성공 | local demo table insert/count 성공 |
| MongoDB | 성공 | local demo collection insert/count 성공 |
| AskLake local file discovery | 성공 | `backend/samples/product_health_reviews_seed.jsonl` schema discovery 성공 |

## 명령/결과 근거

- `docker ps --format ...`: runtime 컨테이너 11개 기동 확인.
- `curl` health checks: `backend_18000=200`, `frontend_5173=200`, `kafka_ui=200`, `airflow_health=200`, `spark_ui=200`, `minio_health=200`.
- `/api/week2/airflow/readiness`: `status=configured`, `trigger_available=true`, `fallback_available=true`, `credential_values_exposed=false`.
- `/api/week2/spark/readiness`: `status=local_smoke_ready`, `cluster_configured=true`, `distributed_cluster_available=false`.
- `/api/kafka-replay/evidence`: `status=missing_evidence`, `sent_rows=0`, `error_count=0`.
- `/api/external-connections/inspect`: DB/S3/Kafka connector는 현재 `400` blocked boundary.

## 실패/주의

- macOS에는 GNU `timeout`이 없어 Kafka consume 첫 시도는 실패했다. Kafka CLI의 `--timeout-ms` 옵션으로 재실행해 성공했다.
- 컨테이너 기동 및 CLI smoke 성공을 AskLake connector runtime 구현 완료로 해석하지 않는다.
- secret value는 문서에 기록하지 않았다. local demo credential은 local-only evidence로만 취급한다.

## 남은 검증

- C-24: `/runs` 화면에 Airflow/Spark/Kafka runtime panel 복구.
- C-25: PostgreSQL/MongoDB/S3/Kafka External Connection test API 구현.
- C-28~C-30: Silver/Gold/Jobs materialization을 실제 runtime과 연결.
- C-31: `Connection -> Source -> Silver -> Gold -> Run -> Catalog -> AI Query` deep browser E2E.
