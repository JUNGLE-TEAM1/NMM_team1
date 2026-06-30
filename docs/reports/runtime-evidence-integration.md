# Runtime evidence integration 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Job Run local materialization 결과에 `duration_ms`, `source_evidence[]`, `runtime_evidence`를 추가하고 `/runs`에 evidence count/duration을 표시했다.
- Verified: backend focused tests 8 passed, frontend build 통과, contract JSON validation 통과, HTTP smoke와 browser smoke에서 evidence 필드 표시를 확인했고 smoke data/output을 정리했다.
- Remaining: M4 Kafka replay와 M2 5GB batch evidence의 실제 통합, CatalogMetadata publish.
- Next context: C-6은 succeeded Job Run의 `output_path`, `schema_preview`, `runtime_evidence`, `source_evidence`를 CatalogMetadata로 publish한다.
- Risk: C-5는 evidence shape 정렬이며 Kafka/Airflow/Spark 대용량 실행 자체는 아니다.
