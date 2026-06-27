# M4 Kafka replay evidence 하네스 연결 plan

## 목표

M4 Kafka Replay가 Kafka topic으로 메시지를 보내는 진행 경과를 AskLake 하네스가 읽을 수 있는 `KafkaReplayEvidence` JSON과 backend API로 남긴다.

## 범위

- `kafka-replay-console/server.mjs`가 replay job evidence를 `data/results/week2/_metadata/kafka_replay`에 저장한다.
- backend가 `GET /api/week2/kafka-replay/health`, `GET /api/week2/kafka-replay/runs`, `GET /api/week2/kafka-replay/runs/{run_id}`로 evidence를 조회한다.
- `contracts/kafka_topic_contract.sample.json`, `docs/03`, `docs/05`, `docs/06`, `docs/07`, manual verification을 갱신한다.

## 제외

- Spark consumer 연결.
- Airflow DAG 내부 Kafka 실행.
- Kafka UI live metric 전체의 장기 저장.

## 완료 기준

- 작은 CSV replay smoke에서 `sent_rows`, `error_count`, `lineage`, `health` evidence가 저장된다.
- backend API가 latest replay evidence를 읽는다.
- focused backend test와 Node syntax check가 통과한다.
