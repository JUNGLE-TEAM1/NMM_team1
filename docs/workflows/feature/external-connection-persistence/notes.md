# External connection persistence 노트

- 2026-06-29: Dataset Module Connection Queue의 첫 Phase로 생성했다.
- PR #284의 External Connection wizard를 기준선으로 삼는다.
- 실제 secret 저장과 connection test는 후속 보안/connector Phase로 넘긴다.
- 2026-06-29: M2~M6 workspace/contract를 확인한 결과, External Connection은 기존 `SourceConnection` / `SourceConfig.connection_ref`에 매핑해야 한다. 새 독립 connection schema를 바로 만들지 않는다.
