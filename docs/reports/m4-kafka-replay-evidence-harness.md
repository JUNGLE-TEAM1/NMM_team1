# M4 Kafka replay evidence 하네스 연결 보고서

## Short Report

- Type: Feature
- Date: 2026-06-27
- Changed: Kafka Replay job evidence 저장, backend evidence 조회 API, contract/docs/manual verification
- Verified: `node --check kafka-replay-console/server.mjs`, `PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py -q`, local Kafka replay smoke
- Remaining: Spark/Airflow consumer 연결은 이번 범위가 아님
- Next context: issue #210, branch `codex/issue-210-m4-replay-evidence`
- Risk: 기존 `test_week2_workflow_catalog.py` 2개는 Windows path separator suffix 기대로 local partial run에서 실패

## Goal

M4 Kafka Replay가 Kafka topic으로 메시지를 보내는 것에서 끝나지 않고, AskLake 하네스가 읽을 수 있는 durable evidence를 남기게 한다.

## Changed Files

- `kafka-replay-console/server.mjs`
- `backend/app/api/week2_kafka_replay.py`
- `backend/app/services/week2_kafka_replay_evidence.py`
- `backend/app/core/app_factory.py`
- `backend/app/core/container.py`
- `backend/tests/test_week2_kafka_replay_evidence.py`
- `contracts/kafka_topic_contract.sample.json`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/manual-verification/08-kafka-replay-parquet-demo.md`

## Implementation Summary

- Replay job lifecycle now persists `KafkaReplayEvidence` JSON at `data/results/week2/_metadata/kafka_replay/<run_id>.json` and `latest.json`.
- Evidence includes source file, topic, partitions, rate, batch size, key column, sent rows, error count, throughput, progress, health, and lineage.
- Backend exposes `GET /api/week2/kafka-replay/health`, `GET /api/week2/kafka-replay/runs`, and `GET /api/week2/kafka-replay/runs/{run_id}`.
- Contract/manual verification now document the difference between Kafka UI live metrics and durable harness evidence.

## Context Budget Evidence

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `docs/03-interface-reference.md`, `contracts/kafka_topic_contract.sample.json`
- Escalated context read: `docs/05`, `docs/06`, `docs/07`, `docs/manual-verification/08-kafka-replay-parquet-demo.md`, relevant backend and replay console code
- Context omitted intentionally: full report history, unrelated frontend UI, Spark/Airflow internals

## Verification Commands

```bash
node --check kafka-replay-console/server.mjs
PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py -q
```

## Quality Gate Evidence

- Focused pytest: PASS, 3 passed, 1 warning.
- Node syntax check: PASS.
- Partial broader run: `backend/tests/test_week2_kafka_replay_evidence.py backend/tests/test_week2_workflow_catalog.py` had 17 passed and 2 existing Windows path suffix failures in `test_week2_workflow_catalog.py`.

## Manual Verification

- Docker Kafka services were running.
- Replay API restarted on `http://localhost:5189`.
- Generated 64KB sample CSV and replayed `25` rows to topic `harness-evidence-smoke-231017`.
- Evidence run id: `run_kafka_replay_20260627141017_dt7ymv`.
- Evidence JSON existed and reported `sent_rows=25`, `error_count=0`, `lineage.target_ref=kafka://localhost:29092/harness-evidence-smoke-231017`.
- Backend TestClient read `/api/week2/kafka-replay/health` and returned `status=ok`, latest run id, topic, sent rows, and error count.

## Final Judgment

- Done: M4 replay progress is now stored in a harness-readable form and exposed through backend API.
- Remaining risk: Spark consumer lag/throughput integration remains a later M2/M4/M5 integration concern.
