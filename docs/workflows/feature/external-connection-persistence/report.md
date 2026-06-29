# External connection persistence 보고서

## Short Report / 짧은 보고

- Type: Contract alignment
- Date: 2026-06-29
- Changed: C-1 구현 전 External Connection UI를 기존 `SourceConnection` / `SourceConfig.connection_ref` 계약에 매핑하도록 plan, decisions, shared docs, sources, quality, sync를 보정했다.
- Verified: `rg`로 M2~M6 workspace/contract 문맥 확인, `git diff --check`, `scripts/validate-harness.sh`.
- Remaining: 최소 persistence/API 또는 fixture adapter 구현 방식 결정 후 실제 C-1 구현.
- Next context: `docs/03-interface-reference.md`의 `SourceConnection`, `contracts/source_config.sample.json`의 `connection_ref`, `contracts/runtime_config.sample.json`의 `source_inputs[]`, `contracts/kafka_topic_contract.sample.json`의 Kafka handoff를 기준으로 구현한다.
- Risk: 새 `/api/external-connections`를 바로 추가하면 기존 `/sources`, Week2 `SourceConfig`, M3/M4 source options와 중복될 수 있다.
