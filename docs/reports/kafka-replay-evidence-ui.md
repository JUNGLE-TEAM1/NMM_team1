# Kafka replay evidence UI 보고서

## Short Report / 짧은 보고

- Type: Phase C-18
- Date: 2026-06-30
- Changed: 실행 기록 화면에 Kafka replay evidence read-only panel을 추가했다.
- Verified: backend focused tests 3개, frontend build, `/runs` browser smoke.
- Remaining: 실제 Kafka consume/produce trigger, broker 실행, replay source 생성은 후속으로 유지한다.
- Next context: Airflow/Spark readiness phase.
- Risk: local replay evidence 파일이 없으면 demo에서는 `missing_evidence`가 보인다.

## Implementation Summary / 구현 요약

- `frontend/src/api/kafkaReplayApi.js`로 `/api/week2/kafka-replay/*` 조회 API를 연결했다.
- `/runs` 화면에서 health, latest run, metrics, lineage를 표시한다.
- evidence가 없으면 `Kafka replay evidence 없음`을 표시하고 전체 화면은 유지한다.
- UI에는 replay 실행 버튼을 추가하지 않았다.

## Verification

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_kafka_replay_evidence.py -q
npm run build
```

- Browser: `/runs`에서 `Kafka Replay Evidence`, `missing_evidence`, evidence directory 표시 확인.
- Backend fixture: evidence present 상태에서 `/health`, `/runs`, `/runs/{run_id}` 확인.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: M4 replay receipt가 실제로 생성되기 전까지는 UI가 missing receipt만 보여준다.
