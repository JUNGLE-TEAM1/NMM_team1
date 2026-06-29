# M4 Kafka contract smoke fixture 정리 보고서

## Short Report

- Type: codex follow-up
- Date: 2026-06-28
- Changed: `contracts/kafka_topic_contract.sample.json`의 M4 replay rate/source file TODO를 기존 실제 smoke evidence 값으로 확정했다.
- Verified: `python -m json.tool contracts/kafka_topic_contract.sample.json`; `PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py -q` -> 3 passed, 1 warning; `scripts/validate-harness.sh --strict` -> passed.
- Remaining: 새 Kafka/Docker smoke는 Docker daemon 미가동으로 실행하지 않았고, 기존 실제 smoke evidence `run_kafka_replay_20260627141017_dt7ymv`를 근거로 사용했다.
- Next context: M4는 1차 발표 blocker가 아니라 supporting evidence로 유지한다.
- Risk: 낮음. runtime code 변경 없이 contract fixture만 정리했다.

## Phase / Hotfix

- Type: codex follow-up
- Branch/work location: `codex/m4-kafka-contract-smoke`, `docs/workflows/codex/m4-kafka-contract-smoke`
- Date: 2026-06-28
- Workspace state: complete

## Verification Commands

```bash
python -m json.tool contracts/kafka_topic_contract.sample.json > $null
PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py -q
rg -n "TODO: confirm M4 replay" contracts/kafka_topic_contract.sample.json
scripts/validate-harness.sh --strict
```

## Manual Verification

- Document executed: not re-run end-to-end.
- Environment: Docker daemon unavailable in current Windows session.
- Evidence: `data/results/week2/_metadata/kafka_replay/latest.json`
- Result: existing successful smoke evidence used for fixture values.

## Final Judgment

- Done: M4 contract fixture is no longer ambiguous.
- Remaining risk: none for first-presentation blocker; Kafka remains supporting evidence.
