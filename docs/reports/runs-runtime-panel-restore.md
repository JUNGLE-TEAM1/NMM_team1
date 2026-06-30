# Runs runtime panel restore

## Type

- Phase: C-24
- Branch/workspace: `feature/runs-runtime-panel-restore`
- Date: 2026-06-30

## Summary

`/runs` 화면에 Airflow, Spark, Kafka runtime/readiness/evidence panel을 복구했다. 패널은 read-only 상태 조회이며 DAG trigger, Spark job 실행, Kafka replay trigger를 수행하지 않는다.

## Changed

- `frontend/src/app/App.jsx`
  - `JobRunsPage` 상단에 `Runtime status` 섹션 추가.
  - 기존 `AirflowReadinessPanel`, `SparkReadinessPanel`, `KafkaReplayEvidencePanel` 렌더링 연결.
- `frontend/src/app/styles.css`
  - `/runs` runtime section/header/grid 스타일 추가.
- `docs/workflows/feature/runs-runtime-panel-restore/*`
  - C-24 workspace evidence 문서 추가.
- `docs/reports/README.md`
  - Latest Report Index에 본 report 추가.

## Verification

| Check | Result |
| --- | --- |
| `npm --prefix frontend run build` | passed |
| `GET /api/week2/airflow/readiness` | `configured`, `trigger_available=true`, `credential_values_exposed=false` |
| `GET /api/week2/spark/readiness` | `local_smoke_ready`, `cluster_configured=true`, `distributed_cluster_available=false` |
| `GET /api/week2/kafka-replay/health` | `missing_evidence`, `sent_rows=0`, `error_count=0` |
| Browser `/runs` smoke | Airflow/Spark/Kafka panel visible |
| Browser console | no errors |

## Browser Evidence

- URL: `http://127.0.0.1:5173/runs`
- 화면 표시 확인:
  - `Airflow Trigger Readiness`
  - `Spark Runner Readiness`
  - `Kafka Replay Evidence`
  - `configured`
  - `local_smoke_ready`
  - `Kafka replay evidence 없음`
  - `여기서 Airflow DAG, Spark job, Kafka replay를 실행하지 않습니다.`

## Acceptance Check

- `/runs`에서 Airflow readiness가 표시된다.
- `/runs`에서 Spark readiness가 표시된다.
- `/runs`에서 Kafka replay evidence health가 표시된다.
- panel이 실제 실행을 완료한 것처럼 과장하지 않는다.
- 브라우저 검수에서 `/runs` console error가 없다.

## Regression / Failure Scenario Check

- readiness-only 상태를 succeeded run으로 표시하지 않았다.
- env missing/configured 상태를 UI에서 숨기지 않았다.
- Kafka evidence가 없는데 replay 성공처럼 보이지 않는다.

## Next

- C-25 `feature/external-connection-runtime-checks`: DB/S3/Kafka connection test API 구현.
