# M2 source input 계약 확장 다음 행동

## 바로 다음

1. GitHub 인증을 복구한 뒤 이 작업을 issue와 remote branch에 연결한다.
2. PR 생성 전 main sync와 CI를 확인한다.

## 후속 구현 후보

1. M5가 `SourceConfig`를 `RuntimeConfig.source_inputs[]`로 변환하는 경로를 만든다.
2. M1 UI source connection form이 `source_type`, `connection_ref`, `format`을 저장하도록 맞춘다.
3. M2가 실제 S3/PostgreSQL/MongoDB/Kafka connector를 하나씩 추가한다.
