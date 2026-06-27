# M4 Kafka replay evidence quality

## 테스트

| Command | Result |
| --- | --- |
| `node --check kafka-replay-console/server.mjs` | PASS |
| `PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py -q` | PASS, 3 passed, 1 warning |
| `PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py backend/tests/test_week2_workflow_catalog.py -q` | PARTIAL, 새 테스트는 통과했으나 기존 workflow catalog 테스트 2개가 Windows path separator suffix 기대값으로 실패 |

## Smoke

- Kafka Docker services: `zookeeper`, `kafka`, `kafka-ui` running.
- Replay API 재시작: `http://localhost:5189`.
- Smoke topic: `harness-evidence-smoke-231017`.
- Replay rows: `25`.
- Evidence run id: `run_kafka_replay_20260627141017_dt7ymv`.
- Evidence result: `sent_rows=25`, `error_count=0`, `lineage.target_ref=kafka://localhost:29092/harness-evidence-smoke-231017`.
- Backend TestClient health result: latest run id, topic, `sent_rows=25`, `error_count=0`, `status=ok`.

## 남은 리스크

- Kafka UI의 broker-side consumer lag는 live UI 확인 대상이며, 이번 PR은 replay job이 산출한 durable evidence 저장에 집중한다.
