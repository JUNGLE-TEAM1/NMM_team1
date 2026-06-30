# Runtime connection verification report 계획

## 목표

Kafka, Airflow, Spark, MinIO, PostgreSQL, MongoDB 로컬 런타임을 실제로 띄운 뒤 확인한 연결 결과를 Phase evidence로 정리하고, AskLake UI/API에서 가능한 범위와 아직 blocked인 범위를 분리한다.

## 상태

- 2026-06-30: 계획 생성. 실제 컨테이너 기동과 CLI smoke는 완료됐지만 Phase evidence 문서로 아직 고정하지 않았다.
- 2026-06-30: 완료. Docker runtime, HTTP health, AskLake readiness/API gap, CLI smoke evidence를 `quality.md`, `report.md`, `docs/reports/runtime-connection-verification-report.md`에 고정했다.

## 범위

- Docker runtime 상태와 포트 목록 정리.
- Kafka produce/consume, Airflow DAG trigger, Spark cluster job, MinIO write/read, PostgreSQL write/read, MongoDB write/read 결과 기록.
- AskLake backend `18000` 기준 API readiness 결과 기록.
- `가능`, `readiness only`, `blocked by API/runtime implementation` 분류.

## 제외 범위

- 새 connector runtime 구현.
- UI 변경.
- credential secret backend 도입.
- Catalog/AI Query end-to-end 구현.

## 선행 조건

- Docker Desktop memory 32GB 적용.
- Kafka/Airflow/Spark/MinIO/PostgreSQL/MongoDB local runtime 기동.
- 검수용 backend/frontend 포트 확인.

## 구현 대상 파일 예상

- `docs/reports/runtime-connection-verification-report.md`
- 필요 시 `docs/07-manual-verification-playbook.md`
- 필요 시 `docs/08-development-workflow.md`

## Acceptance Criteria

- 각 runtime별 접속 URL, credential 정책, smoke 결과가 문서화된다.
- AskLake API가 `local_file/local_folder` 외 connector inspect를 차단하는 현 상태가 명확히 기록된다.
- 후속 Phase가 구현해야 할 실제 gap이 목록화된다.

## Regression / Failure Scenario

- 컨테이너가 떠 있다는 사실을 AskLake connector runtime 완료로 오해하지 않는다.
- Airflow/Spark readiness와 실제 trigger/job 결과를 혼동하지 않는다.
- secret value를 문서에 남기지 않는다. 로컬 demo credential은 local-only evidence로 표시한다.

## Manual Verification

1. `docker ps`로 runtime 상태를 확인한다.
2. Kafka topic produce/consume smoke 결과를 확인한다.
3. Airflow DAG run success와 result artifact를 확인한다.
4. Spark master worker와 sample job 결과를 확인한다.
5. MinIO/PostgreSQL/MongoDB write-read smoke 결과를 확인한다.
6. AskLake API에서 blocked connector inspect 결과를 확인한다.

## Report 기준

- `docs/reports/runtime-connection-verification-report.md`에 검수 명령, 결과, blocked gap, 다음 Phase 후보를 기록한다.
