# Runs runtime panel restore 계획

> Superseded: 2026-06-30 사용자 피드백으로 `/runs`는 compact common run log만 유지하기로 결정했다. Airflow/Spark/Kafka readiness panel은 `/runs`에 복구하지 않고, 후속 필요 시 별도 진단/운영 상태 surface로 분리한다. 현재 대체 Phase는 `feature/runtime-status-surface-decision`이다.

## 과거 목표

이 workspace는 한때 `/runs` 화면에 Airflow, Spark, Kafka runtime/readiness/evidence 상태를 read-only panel로 복구하는 Phase였다.

## 최종 상태

- 2026-06-30: 계획 생성.
- 2026-06-30: 기존 구현에서 `/runs` 상단에 Airflow/Spark/Kafka read-only runtime panel을 복구했고, build/API/browser smoke evidence를 기록했다.
- 2026-06-30: 이후 사용자 피드백으로 superseded 처리했다. `/runs` 화면이 난잡해지는 문제가 확인되어 runtime panel을 제거하고 `/runs`는 run log 전용으로 유지한다.

## 현재 결정

- `/runs`는 Connection/Silver/Gold 공통 run log와 타입 필터만 표시한다.
- Airflow/Spark/Kafka readiness는 `/runs` 첫 화면에 다시 넣지 않는다.
- runtime 상태가 필요하면 별도 진단/운영 상태 surface를 새 Phase로 만든다.
- 이 workspace의 과거 report/quality는 evidence로 보존하되, 다음 구현 지시로 사용하지 않는다.

## 대체 Phase

- `feature/runtime-status-surface-decision`
- `docs/reports/runtime-status-surface-decision.md`

## 다음 행동

C-25 이후 runtime connector/check/materialization Phase를 따른다. `/runs` panel restore를 그대로 재개하지 않는다.
