# External connection type alignment 결정 기록

| 결정 | 내용 | 이유 | 재검토 조건 |
| --- | --- | --- | --- |
| 직접 연결 타입 | `Local File`, `Local Folder`, `Prepared Dataset`을 직접 연결 가능 타입으로 둔다. | 현재 로컬 데이터와 backend runner 계약으로 가장 빨리 수동 데모가 가능하다. | backend에 실제 external connection persistence가 생길 때 |
| Kafka 처리 | Kafka는 제거하지 않고 `Kafka Topic` + replay evidence로 둔다. | M4 streaming 책임을 시나리오에서 보존하면서 broker 기동 리스크를 줄인다. | 실제 Kafka compose/prod broker smoke를 데모에 포함하기로 할 때 |
| 후속 connector | Database/Object Storage는 disabled 후속 Phase로 둔다. | credential, secret_ref, runtime connector가 필요해 이번 UI 정렬 범위를 넘는다. | connector runtime과 secret 정책이 준비될 때 |
