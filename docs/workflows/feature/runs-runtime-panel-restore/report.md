# Runs runtime panel restore

> Superseded: 2026-06-30 이후 `/runs`는 compact common run log로 유지한다. 이 Phase의 panel restore 결과는 증거로 보존하되, 현재 IA 기준 결정은 `feature/runtime-status-surface-decision`이 대체한다.

## 요약

`/runs` 화면 상단에 Airflow, Spark, Kafka runtime 상태 패널을 복구했다. 세 패널은 실행 버튼이 아니라 read-only readiness/evidence 조회로만 동작하며, 실제 실행 가능 상태와 readiness-only 상태를 분리해서 보여준다.

## 변경 사항

- `JobRunsPage`에 `Runtime status` 섹션을 추가했다.
- 기존 `AirflowReadinessPanel`, `SparkReadinessPanel`, `KafkaReplayEvidencePanel`을 `/runs` 상단에 배치했다.
- `.runs-runtime-section`, `.runs-runtime-header`, `.runs-runtime-grid` 스타일을 추가했다.
- `docs/reports/runs-runtime-panel-restore.md`와 report index를 추가했다.

## 검증

- `npm --prefix frontend run build`: 성공.
- backend `18000` 기준 readiness API 3종 응답 확인.
- browser smoke에서 `/runs` 화면에 세 패널이 모두 표시되고 console error가 없음을 확인했다.

## 남은 범위

- Airflow DAG trigger 버튼 추가는 제외.
- Spark distributed job 실행 버튼 추가는 제외.
- Kafka consume/produce/replay trigger 추가는 제외.
- DB/S3/Kafka connector runtime test API는 C-25에서 진행한다.
