# Runs runtime panel restore 결정 기록

> Superseded: 2026-06-30 `feature/runtime-status-surface-decision`으로 대체됐다. 아래 결정은 과거 panel restore evidence이며, 현재 IA 결정은 `/runs` compact run log 유지다.

- Decision status: superseded

## 결정

- `/runs` 상단에 runtime status 섹션을 추가한다.
- Airflow/Spark/Kafka 패널은 read-only로 유지하고 trigger 버튼은 넣지 않는다.
- `configured`, `local_smoke_ready`, `missing_evidence` 같은 backend status를 숨기거나 성공 문구로 바꾸지 않는다.

## Deferred Decisions

| Decision | Reason | Revisit Trigger | Target |
| --- | --- | --- | --- |
| Airflow DAG trigger UI | 당시 C-24에서는 readiness panel만 다뤘고 실제 trigger action은 제외 범위였다. 현재 C-24는 superseded 상태다. | Jobs/Runs runtime integration 시작 | `feature/jobs-runs-runtime-integration` |
| Spark distributed execution UI | backend API가 아직 distributed cluster job 실행을 제공하지 않는다 | Silver/Gold runtime materialization 시작 | `feature/silver-dataset-runtime-materialization` / `feature/gold-dataset-runtime-materialization` |
| Kafka replay trigger UI | durable evidence 조회와 live trigger는 분리해야 한다 | Kafka runtime check 구현 후 | `feature/external-connection-runtime-checks` |
