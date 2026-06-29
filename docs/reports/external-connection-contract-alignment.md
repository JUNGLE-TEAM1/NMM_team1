# External connection contract alignment 보고서

## Short Report / 짧은 보고

- Type: Contract alignment
- Date: 2026-06-29
- Changed: C-1 구현 전 External Connection을 기존 `SourceConnection` / `SourceConfig.connection_ref` 계약에 매핑하도록 workspace 문서를 보정했다.
- Verified: `rg`로 `docs/03-interface-reference.md`, `contracts/source_config.sample.json`, `contracts/runtime_config.sample.json`, `contracts/kafka_topic_contract.sample.json`, Week2 ver2 handoff 문맥 확인. `git diff --check`, `scripts/validate-harness.sh`.
- Remaining: 최소 persistence/API 또는 fixture adapter 구현 방식 결정.
- Next context: External Connection은 UI label이고, backend/module contract는 `SourceConnection`과 `SourceConfig.connection_ref`를 우선 사용한다.
- Risk: 기존 M2~M6 contract를 무시하고 새 connection schema/API를 만들면 M3/M4 source options, M2 runtime input, M5 workflow handoff와 중복된다.
