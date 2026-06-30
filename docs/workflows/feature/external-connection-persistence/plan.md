# External connection persistence 계획

## 브랜치

- Branch: `feature/external-connection-persistence`
- Workspace: `docs/workflows/feature/external-connection-persistence`
- Created: 2026-06-29

## 목표

- `데이터셋 생성 > External Connection` UI 용어를 기존 `SourceConnection` / `SourceConfig.connection_ref` 계약에 맞춘다.
- 구현 전에 External Connection을 새 독립 domain entity로 만들지, 기존 Source Connector 계약의 display layer로 둘지 결정한다.
- C-2 Source Dataset 생성이 `SourceConfig.connection_ref`를 자연스럽게 소비할 수 있도록 mapping을 고정한다.

## 범위

- Contract alignment:
  - UI `External Connection` = contract `SourceConnection` display/use-case label.
  - Source Dataset 생성 입력 = `SourceConfig.connection_ref`.
  - credential은 `secret_ref` 또는 `connection_ref.secret_ref`만 저장하고 실제 secret value는 저장하지 않는다.
- 기존 계약 확인:
  - `docs/03-interface-reference.md`의 `SourceConnection`.
  - `contracts/source_config.sample.json`의 `connection_ref`.
  - `contracts/runtime_config.sample.json`의 `source_inputs[]`.
  - `contracts/kafka_topic_contract.sample.json`의 M4 Kafka handoff.
- 구현은 secret value 없이 External Connection metadata create/list/read API와 UI 저장 버튼을 제공한다.

## 범위 제외

- 실제 credential 저장.
- 실제 connection test.
- 외부 시스템 ingest.
- Target Dataset/job 실행.
- 기존 M2/M3/M4/M5/M6 contract를 우회하는 새 connection schema 발명.

## 구현 프롬프트

```text
@AGENTS.md @docs/08-development-workflow.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`feature/external-connection-persistence` Phase만 구현한다.
구현 전에 External Connection UI를 기존 `SourceConnection`과 `SourceConfig.connection_ref` 계약에 매핑한다.
새 독립 entity를 만들기보다 기존 Source Connector boundary를 우선 사용하고, 필요한 경우 최소 persistence/API만 추가한다.
M3 CSV/JSON/JSONL options, M4 Kafka options, M2 `RuntimeConfig.source_inputs[]`, M5 workflow handoff와 충돌하지 않게 한다.
secret value 저장과 실제 connection test는 제외하고, credential은 `secret_ref`/`connection_ref.secret_ref` metadata로만 표현한다.
완료 전 frontend build, backend focused tests, harness validation, browser smoke를 기록한다.
```

## 완료 기준

- [x] 기존 M2~M6 contract에서 가져올 connection/source boundary를 확인했다.
- [x] External Connection UI와 `SourceConnection` / `SourceConfig.connection_ref` mapping을 문서화했다.
- [x] 최소 persistence/API 구현 방식을 결정하고 `/api/external-connections` create/list/read를 추가했다.
- [x] 구현 시 Source Dataset wizard가 contract-compatible connection 목록을 사용한다.
- [x] secret value가 repo, local storage, API response에 남지 않는다.
- [x] report와 quality evidence를 남긴다.
