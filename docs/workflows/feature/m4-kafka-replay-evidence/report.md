# M4 Kafka replay evidence 하네스 연결 report

## Short Report

- Type: Feature
- Date: 2026-06-27
- Changed: M4 replay job evidence 저장, backend 조회 API, KafkaTopicContract/docs/manual verification
- Verified: Node syntax, focused backend pytest, local Kafka replay smoke, backend health read
- Remaining: Spark/Airflow consumer 연결은 별도 범위
- Next context: issue #210, PR body `Closes #210`
- Risk: Windows에서 기존 workflow catalog 테스트 2개가 path separator 기대값으로 실패

## Context Budget Evidence

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `docs/03-interface-reference.md`, `contracts/kafka_topic_contract.sample.json`
- Escalated context read: `docs/05`, `docs/06`, `docs/07`, `docs/manual-verification/08-kafka-replay-parquet-demo.md`, Week2 backend service/router/tests
- Context omitted intentionally: 전체 report history, unrelated frontend UI, Spark/Airflow implementation internals

## Implementation Summary

- `kafka-replay-console/server.mjs` now writes `KafkaReplayEvidence` to `data/results/week2/_metadata/kafka_replay/<run_id>.json` and `latest.json`.
- Backend exposes replay evidence through `/api/week2/kafka-replay/health`, `/api/week2/kafka-replay/runs`, and `/api/week2/kafka-replay/runs/{run_id}`.
- Contract and manual verification now separate Kafka UI live metrics from durable AskLake harness evidence.

## Verification Commands

```bash
node --check kafka-replay-console/server.mjs
PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py -q
```

## Manual Verification

- Kafka replay smoke used generated 64KB CSV sample and `maxRows=25`.
- Result evidence:
  - topic: `harness-evidence-smoke-231017`
  - run id: `run_kafka_replay_20260627141017_dt7ymv`
  - sent rows: `25`
  - errors: `0`
  - target: `kafka://localhost:29092/harness-evidence-smoke-231017`
- Backend health read returned `status=ok`, latest run id, topic, sent rows, and error count.

## docs/05 Acceptance Link

- Related item: M4 Kafka replay supporting evidence 조회.
- Status: Implemented and smoke verified.
- Evidence: `backend/tests/test_week2_kafka_replay_evidence.py`, local replay smoke.

## Regression Guard

- Checked feature: Kafka UI만 보고 완료 처리하는 회귀.
- Protected behavior: `KafkaReplayEvidence` JSON과 backend API가 함께 존재해야 한다.
- Result: Guard added to `docs/06`.

## Secret / Migration / Env Check

- Secret check: no credentials added.
- Migration/data change: no DB migration; local ignored `data/results/week2/_metadata/kafka_replay` runtime evidence only.
- Env change: optional `KAFKA_REPLAY_EVIDENCE_DIR` override added for replay console.
