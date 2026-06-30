# Runtime status surface decision 계획

## 목표

`/runs`는 Connection/Silver/Gold 공통 run log만 보여주는 compact 화면으로 유지하고, Airflow/Spark/Kafka readiness/evidence panel은 `/runs` 첫 화면에 복구하지 않는다. 필요 시 후속 Phase에서 별도 진단/운영 상태 surface로 분리한다.

## 상태

- 2026-06-30: 계획 생성. `runs-runtime-panel-restore`는 사용자 피드백으로 superseded 처리한다.
- 2026-06-30: 구현 완료. `/runs`는 `전체/Connection/Silver/Gold/실패` 필터와 compact run card만 표시한다.

## 범위

- `docs/08-development-workflow.md`의 C-24 이후 Phase 순서 보정.
- 기존 `runs-runtime-panel-restore` workspace를 삭제하지 않고 superseded로 표시.
- `/runs` 화면 원칙을 `run log only`로 문서화.
- Airflow/Spark/Kafka readiness는 별도 surface 후보로 남긴다.

## 제외 범위

- 새 runtime diagnostics 화면 구현.
- Airflow DAG trigger, Spark job submit, Kafka replay trigger 추가.
- Connection/Silver run persistence 구현.
- 기존 report/quality evidence 삭제.

## 선행 조건

- C-23 runtime verification evidence가 존재한다.
- `/runs` compact UI hotfix가 적용되어 있다.

## Acceptance Criteria

- C-24 row가 `runtime-status-surface-decision`으로 바뀐다.
- `runs-runtime-panel-restore`가 superseded로 명시된다.
- C-25 이후 Phase 선행 조건이 C-24 이후 흐름과 충돌하지 않는다.
- `/runs`에 runtime readiness panel을 복구하라는 문서 지시가 남지 않는다.

## Regression / Failure Scenario

- `/runs`에 Airflow/Spark/Kafka readiness panel을 다시 넣으라고 지시하면 실패다.
- 기존 C-18~C-23 evidence를 삭제하면 실패다.
- runtime readiness가 실행 성공 로그처럼 보이면 실패다.

## Manual Verification

1. `docs/08-development-workflow.md`에서 C-24 row와 C-25 이후 선행 조건을 확인한다.
2. `docs/workflows/feature/runs-runtime-panel-restore/plan.md`가 superseded 상태인지 확인한다.
3. `/runs` browser smoke evidence는 `dataset-management-actions` report/quality를 참조한다.

## Report 기준

- `docs/reports/runtime-status-surface-decision.md`에 결정, 변경 문서, 남은 후속 Phase를 기록한다.
