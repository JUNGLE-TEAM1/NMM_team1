# M4 Kafka contract smoke fixture 정리 계획

## 브랜치

- Branch: `codex/m4-kafka-contract-smoke`
- Workspace: `docs/workflows/codex/m4-kafka-contract-smoke`
- GitHub issue: `#225`
- Created: 2026-06-28

## 목표

- M4 Kafka replay contract fixture에 남아 있던 replay rate/source file TODO를 실제 smoke evidence 값으로 확정한다.
- M4를 1차 발표 Gold 생성 필수 경로가 아니라 supporting evidence로 유지한다.

## 범위

- `contracts/kafka_topic_contract.sample.json`의 `replay.rate_per_second`, `replay.source_file`, `updated_at` 갱신.
- 기존 실제 smoke evidence `run_kafka_replay_20260627141017_dt7ymv` 값을 근거로 사용.
- JSON syntax와 M4 Kafka replay evidence focused test 검증.
- workspace/report/PR evidence 작성.

## 범위 제외

- Kafka를 `gold_product_health` 생성 필수 입력으로 연결하지 않는다.
- 새 Kafka/Docker smoke 실행은 이번 범위에서 필수로 두지 않는다.
- 로컬 untracked 산출물은 포함하지 않는다.

## 완료 기준

- [x] `contracts/kafka_topic_contract.sample.json`에 `TODO: confirm M4 replay ...`가 남지 않는다.
- [x] JSON syntax check가 통과한다.
- [x] M4 Kafka replay evidence focused backend test가 통과한다.
- [x] issue/workspace/report/PR 추적이 연결된다.
