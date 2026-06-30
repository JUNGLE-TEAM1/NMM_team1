# External connection type alignment 계획

## 상태

Completed.

## 목표

External Connection 화면에서 서로 다른 원천 데이터 타입을 데모 가능한 연결 방식으로 정리하고, Kafka를 제거하지 않고 replay/sample evidence 경로로 명확히 남긴다.

## 범위

- Connector Type 선택지를 `Local File`, `Local Folder`, `Prepared Dataset`, `Kafka Topic` 중심으로 재정렬한다.
- PostgreSQL/MongoDB/API/S3 같은 production connector는 이번 데모의 직접 연결 대상이 아니라 후속 Phase로 표시한다.
- Source Dataset connection 선택 카드도 Product Health 파일, Taxi Parquet folder, prepared bundle, Kafka topic 중심으로 맞춘다.
- Kafka는 broker live check가 아니라 `KafkaTopicContract + source_inputs[].topic` / replay evidence로 표현한다.
- `Connector Type`은 데이터셋 종류가 아니라 연결 방식임을 명확히 하고, 2단계 `Configure & Inspect`에서 사용자가 `소스 검사`를 실행한 뒤 format/schema/sample 기반 데이터셋 의미를 preview한다.

## 제외

- 새 `/api/external-connections` backend API 추가.
- credential 저장.
- 실제 Kafka broker 기동/metadata check.
- 기존 raw 데이터 삭제.

## 완료 기준

- External Connection wizard에 Local File/Folder/Prepared Dataset/Kafka Topic이 보인다.
- Kafka Topic 선택 후 Configure & Inspect 단계에서 topic, replay evidence, Kafka contract hint가 보이고, `소스 검사` 실행 후 detected dataset preview가 보인다.
- 후속 connector는 disabled/후속 Phase로 보인다.
- frontend build와 browser smoke가 통과한다.
