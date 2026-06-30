# Runs runtime panel restore 품질 기록

## Context Budget

- Mode: Lite Read
- 읽은 문서: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md` C-24 섹션, `docs/workflows/feature/runs-runtime-panel-restore/plan.md`, `docs/reports/runtime-connection-verification-report.md`, `docs/07-manual-verification-playbook.md` 관련 C-18~C-20 항목
- 사용 skill/tool: browser skill, in-app browser verification

## 검증 명령

```bash
npm --prefix frontend run build
```

- 결과: 성공. Vite production build 완료.

```bash
curl -fsS http://127.0.0.1:18000/api/week2/airflow/readiness
curl -fsS http://127.0.0.1:18000/api/week2/spark/readiness
curl -fsS http://127.0.0.1:18000/api/week2/kafka-replay/health
```

- Airflow: `status=configured`, `trigger_available=true`, `fallback_available=true`, `credential_values_exposed=false`
- Spark: `status=local_smoke_ready`, `cluster_configured=true`, `distributed_cluster_available=false`
- Kafka: `status=missing_evidence`, `sent_rows=0`, `error_count=0`

## Browser Smoke

- URL: `http://127.0.0.1:5173/runs`
- 확인:
  - `Airflow Trigger Readiness` 표시됨.
  - `Spark Runner Readiness` 표시됨.
  - `Kafka Replay Evidence` 표시됨.
  - `configured`, `local_smoke_ready`, `Kafka replay evidence 없음`이 화면에 표시됨.
  - `여기서 Airflow DAG, Spark job, Kafka replay를 실행하지 않습니다.` 문구가 표시됨.
  - console error 없음.

## Regression / Failure Scenario

- readiness-only 상태를 succeeded run으로 표시하지 않았다.
- Airflow credential value는 표시하지 않고 configured 여부만 표시했다.
- Kafka evidence가 없을 때 성공처럼 보이지 않고 `missing_evidence` / `Kafka replay evidence 없음`으로 표시했다.
- Spark는 cluster env가 있더라도 distributed job 실행 가능으로 과장하지 않고 `distributed_cluster_available=false`를 표시했다.
