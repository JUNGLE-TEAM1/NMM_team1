# M4 Kafka contract smoke fixture 정리 보고서

## Short Report

- Type: codex follow-up
- Branch/work location: `codex/m4-kafka-contract-smoke`, `docs/workflows/codex/m4-kafka-contract-smoke`
- Date: 2026-06-28
- Workspace state: complete
- Context Budget mode: Escalate Read for Git/contract PR handoff
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/11-git-sync-policy.md`, `contracts/kafka_topic_contract.sample.json`, M4 smoke evidence JSON
- Escalated context read: PR #224 state, issue #210 state, M4 focused backend test
- Context omitted intentionally: unrelated M1/M2/M3/M5/M6 implementation internals, local untracked artifacts
- Changed: M4 Kafka replay contract fixture의 replay rate/source file TODO를 기존 실제 smoke evidence 값으로 확정했다.
- Verified: JSON syntax passed; M4 Kafka replay evidence focused test passed, 3 passed with 1 existing FastAPI/TestClient deprecation warning; strict harness passed.
- Remaining: 새 Kafka smoke는 Docker daemon 미가동으로 실행하지 않았고, 기존 실제 smoke evidence를 근거로 사용했다.
- Next context: M4는 1차 발표 blocker가 아니라 supporting evidence로 유지한다. product-health E2E는 M3/M2/M5/M6/M1 라인이 닫아야 한다.
- Risk: 낮음. contract fixture 정리이며 runtime code 변경은 없다.

## Changed Files

- `contracts/kafka_topic_contract.sample.json`
- `docs/workflows/codex/m4-kafka-contract-smoke/*`
- `docs/reports/m4-kafka-contract-smoke.md`
- `docs/reports/README.md`

## Verification Commands

```bash
python -m json.tool contracts/kafka_topic_contract.sample.json > $null
PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py -q
rg -n "TODO: confirm M4 replay" contracts/kafka_topic_contract.sample.json
scripts/validate-harness.sh --strict
```

## Regression Guard

- Checked feature: M4 Kafka replay evidence contract fixture
- Protected behavior: backend still reads Kafka replay evidence and exposes focused routes.
- Result: focused route/service tests passed.

## Manual Verification

- Document executed: not re-run end-to-end because Docker daemon was not available.
- Evidence: `data/results/week2/_metadata/kafka_replay/latest.json`
- Existing run id: `run_kafka_replay_20260627141017_dt7ymv`
- Result: existing evidence had `records_per_second=1000`, source file `sample-65536-bytes.csv`, `sent_rows=25`, `error_count=0`.

## Final Judgment

- Done: M4 contract fixture TODO is removed and tied to actual smoke evidence.
- Remaining risk: none for M4 presentation blocker. Kafka should stay supporting evidence for the first presentation.
