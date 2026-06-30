# Kafka replay evidence UI 품질 기록

## Context

- Phase: C-18 `feature/kafka-replay-evidence-ui`
- Date: 2026-06-30
- Branch/work location: `feature/external-connection-persistence` branch에서 진행. 기존 dirty worktree가 커서 branch 전환은 수행하지 않았다.

## Commands

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_kafka_replay_evidence.py -q
npm run build
```

## Results

- Backend focused tests: passed, `3 passed in 0.23s`
- Frontend build: passed
- Browser smoke:
  - `/runs`에서 `Kafka Replay Evidence` panel 확인
  - local evidence가 없는 상태에서 `missing_evidence`, `Kafka replay evidence 없음`, evidence directory 표시 확인
  - 실제 Kafka consume/produce trigger 버튼이 없음을 확인

## Regression Notes

- Evidence missing은 broker failure가 아니라 durable receipt 없음 상태로 표시한다.
- C-18은 조회 전용이며 Kafka broker 실행, topic consume/produce, replay source 생성은 포함하지 않는다.

## Skipped / Deferred

- 로컬에 실제 M4 replay receipt가 없어 브라우저 smoke는 missing evidence 상태로 수행했다.
- Evidence present 상태는 backend focused test가 `run_kafka_replay_001` fixture로 `/health`, `/runs`, `/runs/{run_id}`를 검증한다.
