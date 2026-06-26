# M5 Local Runner Representative Path 다음 작업

## Recommended Next Action

- Commit/push/PR 준비 전에 `scripts/validate-harness.sh --strict`를 다시 실행하고, 가능하면 PR을 생성한다.

## 바로 다음 후보

1. 실제 Airflow adapter slice
   - Airflow가 없을 때 fallback이 아니라, Airflow API/DAG trigger가 가능한 환경에서 `Week2RunnerResult` 호환 결과를 받는 경로를 만든다.

2. SparkRunner integration slice
   - M2 `SparkRunner` smoke가 준비된 뒤 M5 runner selection에 붙인다.
   - `spark_runner`는 실제 구현 전까지 지원 executor로 열지 않는다.

3. M3 TransformSpec adapter slice
   - M3가 만든 `TransformSpec`를 local runner 또는 SparkRunner 입력으로 넘기는 adapter를 만든다.

## 이번 PR 이후 학습 포인트

- M5 local runner는 “임시 실행기”가 아니라 demo 대표 경로의 기준 output/Catalog evidence generator다.
- 후속 runner는 이 테스트가 확인하는 run/catalog/output 연결을 그대로 만족해야 한다.
