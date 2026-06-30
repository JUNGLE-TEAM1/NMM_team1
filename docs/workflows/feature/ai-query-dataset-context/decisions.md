# AI query dataset context 결정

- Decision: AI Query service 자체를 크게 바꾸지 않고 CatalogSource adapter를 추가한다.
- Reason: 기존 `Week2AIQueryService`는 catalog dict 목록만 소비하므로 adapter가 가장 작은 변경 경계다.
- Deferred: SQL allowlist policy engine, RAG, goal 추천, 자동 recipe 생성.
