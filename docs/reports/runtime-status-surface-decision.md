# Runtime status surface decision

## 요약

`/runs` 화면은 Connection/Silver/Gold 공통 실행 로그를 간결하게 보여주는 화면으로 유지한다. Airflow/Spark/Kafka readiness/evidence panel은 `/runs` 첫 화면에 복구하지 않고, 필요하면 별도 진단/운영 상태 surface로 분리한다.

## 변경 사항

- `docs/08-development-workflow.md`의 C-24를 `feature/runtime-status-surface-decision`으로 변경했다.
- C-25 선행 조건을 C-24 완료 이후로 정렬했다.
- C-26 선행 조건을 C-25A 이후로 정렬했다.
- `docs/workflows/feature/runtime-status-surface-decision/` workspace 문서를 생성했다.
- 기존 `docs/workflows/feature/runs-runtime-panel-restore/`는 삭제하지 않고 superseded note를 추가했다.

## 검증

- `docs/08-development-workflow.md` C-24~C-31 구간을 확인했다.
- `runs-runtime-panel-restore` plan/report/next-actions에 superseded 상태가 표시되는지 확인했다.
- `/runs` compact UI browser smoke evidence는 `docs/workflows/feature/dataset-management-actions/quality.md`에 기록된 결과를 참조한다.

## 남은 범위

- 실제 Connection/Silver run persistence는 C-29 또는 그 전 runtime materialization Phase에서 구현한다.
- PostgreSQL/MongoDB/S3/Kafka connection test와 wizard UX는 C-25/C-25A에서 진행한다.
- Source ingest, Silver/Gold runtime materialization, Catalog/AI Query E2E는 C-26 이후 순서대로 진행한다.

## 다음 문맥

다음 실행 후보는 C-25 또는 이미 구현된 C-25/C-25A 상태 재검수다. `/runs`에 runtime readiness panel을 복구하는 방향은 현재 IA 결정과 충돌하므로 다시 진행하지 않는다.
