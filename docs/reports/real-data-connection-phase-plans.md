# Real data connection phase plans 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-30
- Changed: 실제 데이터 연결 고도화를 한 번에 구현하지 않고 C-14~C-22 후속 Phase로 분리했다. `external-connection-local-discovery`, `product-health-prepared-dataset-link`, `file-backed-dataset-detail`, `gold-build-local-materialization-alignment`, `kafka-replay-evidence-ui`, `airflow-trigger-readiness`, `spark-runner-readiness`, `catalog-dataset-management-boundary`, `credential-secret-connection-design` workspace plan을 생성하고 `docs/08-development-workflow.md`의 Dataset Module Connection Queue에 추가했다.
- Verified: `rg`로 C-14~C-22 queue와 각 workspace `plan.md` 존재를 확인했다.
- Remaining: 구현은 시작하지 않았다. 다음 구현 후보는 C-14 `external-connection-local-discovery`.
- Next context: Kafka/Airflow/Spark/secret은 실제 외부 서비스 정보가 없으면 readiness/design Phase로 유지한다. Product Health prepared dataset은 Kaggle ecommerce evidence와 현재 raw folder 상태 mismatch 검증이 필요하다.
- Risk: Phase 문서는 계획이며 API/schema 구현 계약은 각 구현 Phase 시작 시 Source of Truth에 다시 반영해야 한다.
