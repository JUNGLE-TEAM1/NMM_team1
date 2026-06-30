# External connection type alignment 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: External Connection 화면을 `Local File`, `Local Folder`, `Prepared Dataset`, `Kafka Topic` 중심으로 정리하고, Database/Object Storage는 후속 Phase로 disabled 표시했다. `Connector Type`은 연결 방식이고 데이터셋 의미는 `Configure & Inspect`의 `소스 검사` 실행 후 preview에서 판정되는 구조로 보정했다.
- Verified: `cd frontend && npm run build`, `git diff --check`, browser `/dataset` smoke, Kafka configure smoke, browser console error check 통과.
- Remaining: 실제 persistence/API, Source Dataset 저장, Kafka replay endpoint 연결, backend auto-detect는 후속 Phase다.
- Next context: Kafka는 제거하지 않고 `KafkaTopicContract + source_inputs[].topic` / replay evidence 경로로 유지한다.
- Risk: 이번 변경은 UI 정렬이다. 실제 broker 연결이나 credential 저장은 아직 없다.

## Browser Evidence

- URL: `http://127.0.0.1:13011/dataset`
- 확인: `Local File`, `Local Folder`, `Prepared Dataset`, `Kafka Topic`
- Kafka Configure & Inspect 확인: `소스 검사`, `검사 대기`, `Replay evidence`, `KafkaTopicContract + source_inputs[].topic`, `commerce.order.events`, detected dataset preview
- Console error: 없음
