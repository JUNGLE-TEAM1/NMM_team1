# Spark runner readiness 보고서

## Short Report / 짧은 보고

- Type: Phase C-20
- Date: 2026-06-30
- Changed: `GET /api/week2/spark/readiness`와 `/runs`의 Spark Runner Readiness panel을 추가했다.
- Verified: backend focused tests `16 passed`, frontend build 통과.
- Remaining: distributed Spark cluster 실행, S3/DB/Kafka source Spark read, Product Health 대용량 ETL 재실행은 후속 Phase다.
- Next context: C-21 CatalogDataset management boundary 또는 C-22 credential/secret connection design.
- Risk: readiness는 local smoke 가능 상태 설명이며 cluster job 성공 evidence가 아니다.

## 변경 요약

- `Week2SparkRunner`에 read-only readiness summary를 추가했다.
- Week2 workflow router에 `/api/week2/spark/readiness`를 추가했다.
- `/runs` 화면에 Spark Runner Readiness panel을 추가했다.
- UI는 `local_file` local smoke와 distributed cluster execution을 분리해서 표시한다.

## 검증

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_spark_readiness.py backend/tests/test_week2_spark_runner.py -q
npm run build
```

결과:

- Backend focused tests: `16 passed`.
- Frontend build: 통과.
- Readiness shape: `runner_implementation=local_pyarrow_smoke`, `supported_source_types=["local_file"]`, `distributed_cluster_available=false`.

## 문서 업데이트

- `docs/03-interface-reference.md`: Spark readiness route와 response boundary 추가.
- `docs/05-acceptance-scenarios-and-checklist.md`: Spark readiness 수용 기준 추가.
- `docs/06-regression-and-failure-scenarios.md`: distributed Spark 실행 가능처럼 보이는 회귀 시나리오 추가.
- `docs/07-manual-verification-playbook.md`: C-20 수동 검증 절차 추가.

## 남은 위험

- `ASKLAKE_SPARK_MASTER_URL` 또는 `SPARK_MASTER_URL`이 있어도 이번 Phase에서는 configured metadata로만 표시한다.
- 실제 cluster execution은 master/cluster evidence와 별도 실행 Phase가 필요하다.
