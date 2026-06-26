# M5 Runner Selection Catalog Guard 다음 작업

## Current Next Action

1. push와 PR 생성을 진행할지 사람에게 확인한다.
2. 진행 시 현재 branch를 remote에 push한다.
3. PR을 만들고 remote CI 결과를 확인한다.

## Deferred Actions

| Action | Reason | Resume trigger |
| --- | --- | --- |
| external Airflow trigger 구현 | URL/auth/DAG/polling contract 없음 | Airflow runtime이 준비되고 trigger contract가 정해질 때 |
| SparkRunner 연결 | M2 smoke 결과 필요 | M2 `SparkRunner`가 `Week2RunnerResult` 호환 metrics를 반환할 때 |
| M3 TransformSpec adapter 연결 | M3 output 필요 | M3 JSON TransformSpec가 생성되고 fixture/test가 준비될 때 |
