# Runs runtime panel restore 메모

## UI 의도

- `/runs`는 실행 기록 화면이지만, 현재 runtime 상태를 함께 봐야 다음 조작이 이해된다.
- Airflow/Spark/Kafka panel은 실행기가 아니라 현재 연결/증거 상태를 읽는 보조 영역이다.
- 패널을 실행 로그 목록 위에 배치해 "환경 상태 확인 -> run log 확인" 순서로 읽히게 했다.

## 표시 상태

| Panel | 현재 표시 |
| --- | --- |
| Airflow | `configured`, trigger metadata ready, credential value not exposed |
| Spark | `local_smoke_ready`, cluster env configured, distributed job unavailable |
| Kafka | `missing_evidence`, latest run 없음 |

## 주의

- Kafka broker가 떠 있어도 replay evidence file이 없으면 UI는 성공으로 표시하지 않는다.
- Spark cluster CLI smoke가 있어도 AskLake API가 distributed job을 실행하는 것은 아니다.
- Airflow readiness는 조회만 수행하며 DAG trigger는 실행하지 않는다.
