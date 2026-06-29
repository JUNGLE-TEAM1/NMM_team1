# M4 Kafka contract smoke fixture 정리 노트

## 진행 메모

- 2026-06-28: 사용자가 M4 담당 범위에서 남은 항목만 PR/issue 흐름에 태우라고 지시했다.
- `data/results/week2/_metadata/kafka_replay/latest.json`에 기존 실제 smoke evidence가 남아 있었다.
- Docker daemon은 현재 실행 중이 아니어서 새 Kafka smoke는 수행하지 않았다.

## 사용한 smoke evidence

- run id: `run_kafka_replay_20260627141017_dt7ymv`
- source file: `demo-output/replay-samples/sample-65536-bytes.csv`
- records per second: `1000`
- topic: `harness-evidence-smoke-231017`
- sent rows: `25`
- error count: `0`

## 판단

- 이번 변경은 M4 supporting evidence fixture 정리다.
- 발표 핵심 product-health E2E 라인의 blocker가 아니다.
