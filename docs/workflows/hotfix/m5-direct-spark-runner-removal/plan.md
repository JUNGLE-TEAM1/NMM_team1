# M5 direct spark_runner 제거 Hotfix 계획

## 브랜치

- Branch: `fix-#287`
- Workspace: `docs/workflows/hotfix/m5-direct-spark-runner-removal`
- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/287
- Date: 2026-06-29

## 목표

M5 workflow API에서 `executor=spark_runner`를 직접 선택하는 경로를 제거한다.

## 범위

- `Week2WorkflowRunRequest.executor` 허용값을 `local_runner`, `airflow`로 제한한다.
- `Week2WorkflowService`의 direct `Week2SparkRunner` 호출 분기를 제거한다.
- fixture/docs/test에서 direct `spark_runner`를 M5 executor로 설명하지 않게 맞춘다.

## 범위 제외

- M2 `Week2SparkRunner` 독립 smoke 구현 삭제.
- Airflow DAG 내부 Spark 호출 구현.
- Product-health 후속 경로 변경.

## 완료 기준

- [x] `spark_runner` 요청이 run 생성 전 거부된다.
- [x] focused backend test가 통과한다.
- [x] 관련 JSON fixture가 유효하다.
- [x] Phase report가 작성되어 있다.
