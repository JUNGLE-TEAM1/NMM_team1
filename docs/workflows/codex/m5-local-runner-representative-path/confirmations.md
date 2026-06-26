# M5 Local Runner Representative Path 확인 기록

## 사람 확인 필요 여부

- 실제 Airflow/Spark 연결: 필요. 별도 slice에서 범위와 실행 환경을 확인해야 한다.
- 이번 representative path test 추가: 필요 없음. 기존 동작을 확인하는 test-only 변경이다.
- Source of Truth 계약 변경: 없음.

## 자동 진행 기준

- focused test 통과 후 commit/push/PR 생성까지 진행 가능하다.
- PR merge/finalize/cleanup은 사람 선택 전 실행하지 않는다.
