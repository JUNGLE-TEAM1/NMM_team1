# External connection persistence 다음 행동 메뉴

1. Recommended: C-1 구현 전 `SourceConnection` / `SourceConfig.connection_ref` compatible 최소 persistence 방식을 정한다.
2. Alternative: API 구현 대신 fixture adapter로 External Connection 목록을 먼저 제공하고 C-2에서 Source Dataset persistence로 넘긴다.
3. Stop: credential 저장/connection test 또는 production connector 실행이 요구되면 별도 결정으로 분리한다.
