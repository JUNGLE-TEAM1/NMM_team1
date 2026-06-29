# M5 direct spark_runner 제거 Hotfix next actions

## 현재 상태

- `spark_runner` direct executor 제거 구현 완료.
- focused test 통과.
- PR #288 생성 완료.

## 다음 선택지

1. PR #288 리뷰에서 wording/범위 확인.
2. 별도 Phase로 Airflow DAG 내부 Spark 호출 설계.
3. M2 `Week2SparkRunner` smoke는 독립 runtime evidence로 유지.
