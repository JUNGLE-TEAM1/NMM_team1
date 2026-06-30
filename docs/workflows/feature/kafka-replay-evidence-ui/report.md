# Kafka replay evidence UI 보고서

## Short Report / 짧은 보고

- Type: Phase C-18
- Date: 2026-06-30
- Changed: `/runs`에 Kafka replay health/run receipt read-only panel을 추가했다.
- Verified: backend focused tests 3개, frontend build, `/runs` browser smoke.
- Remaining: 실제 Kafka broker/topic consume/produce trigger는 후속 Phase로 유지한다.
- Next context: C-19 Airflow readiness 또는 C-20 Spark runner readiness.
- Risk: local M4 replay evidence 파일이 아직 없어 demo에서는 `missing_evidence`가 표시된다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/external-connection-persistence`, workspace `docs/workflows/feature/kafka-replay-evidence-ui/`
- Date: 2026-06-30
- Workspace state: completed, local dirty changes present

## Goal / 목표

- Kafka replay evidence를 실행 기록 화면에서 확인하되, 실제 Kafka 실행 기능처럼 보이지 않게 한다.

## Changed Files / 변경 파일

- `frontend/src/api/kafkaReplayApi.js`
- `frontend/src/api/asklakeClient.js`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/workflows/feature/kafka-replay-evidence-ui/plan.md`
- `docs/workflows/feature/kafka-replay-evidence-ui/quality.md`

## Implementation Summary / 구현 요약

- Kafka replay API client를 추가했다.
- `/runs`에 `Kafka Replay Evidence` panel을 추가해 health, topic, sent rows, errors, throughput/progress를 표시한다.
- evidence가 있으면 latest run의 source/target lineage와 metrics를 read-only로 보여준다.
- evidence가 없으면 `Kafka replay evidence 없음`으로 표시하고 전체 화면은 정상 유지한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_kafka_replay_evidence.py -q
npm run build
```

## Manual Verification / 수동 검증

- Environment: backend `127.0.0.1:18000`, frontend `127.0.0.1:5173`
- Result: `/runs`에 Kafka Replay Evidence panel 표시
- Evidence: local evidence 없음 상태에서 `missing_evidence`, `Kafka replay evidence 없음`, `data/results/week2/_metadata/kafka_replay` 표시
- Limitation: evidence present browser smoke는 수행하지 않았고 backend fixture test로 대체했다.

## Regression Guard / 회귀 보호

- Checked feature: Kafka replay evidence read-only UI
- Protected behavior: missing evidence가 broker failure처럼 보이지 않고, UI가 실제 replay trigger를 제공하지 않는다.
- Result: passed

## Context For Next Phase / 다음 Phase 문맥

- C-19는 Airflow readiness/fallback 표시 전용이다.
- C-20은 Spark runner readiness 표시 전용이다.
- Kafka 실제 replay trigger는 broker/topic/source file 정보가 확정된 뒤 별도 Phase에서 다룬다.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: 실제 M4 evidence 파일이 없으면 데모에서 Kafka panel은 missing receipt 상태로만 보인다.
