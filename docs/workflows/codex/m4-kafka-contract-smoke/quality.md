# M4 Kafka replay 설정 보강 품질 기록

- Quality gate status: passed
- Source Of Truth impact: M4 Kafka replay evidence/dead-letter/retention 설정 계약 보강
- Harness test impact: M4 Kafka replay evidence backend test 유지

## TDD Plan

- Applies: partial
- Reason: Node replay console에 dead-letter/retention 동작을 추가했고, 기존 backend evidence 조회 계약은 유지한다.
- Failing test first: not run; 기존 focused backend test와 Node syntax check로 설정 변경을 검증한다.
- Pass command/result:
  - `node --check kafka-replay-console/server.mjs` -> passed
  - `python -m json.tool contracts/kafka_topic_contract.sample.json > $null` -> passed
  - `PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py -q` -> passed, 3 passed, 1 warning
  - `git diff --check` -> passed
- Refactor notes: 없음

## Branch Checks

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| Node syntax | `node --check kafka-replay-console/server.mjs` | passed | local command |
| JSON syntax | `python -m json.tool contracts/kafka_topic_contract.sample.json > $null` | passed | local command |
| focused test | `PYTHONPATH=backend python -m pytest backend/tests/test_week2_kafka_replay_evidence.py -q` | passed, 3 passed, 1 warning | local command |
| whitespace check | `git diff --check` | passed | local command |

## CI/CD Gate

- CI required: yes before merge
- CI result: pending PR creation
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: revert the dead-letter/retention commit if local replay console evidence handling regresses

## Skipped Checks

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| 새 Kafka/Docker failure smoke | Docker daemon을 새로 띄우지 않고 설정/문법/계약/기존 backend test로 검증했다. | 사용자 요청은 설정 보강과 PR/이슈 생성 |
| full backend suite | 변경 초점이 replay console 설정과 M4 evidence 계약에 한정된다. | no |
