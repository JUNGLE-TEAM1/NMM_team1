# AI query dataset context 다음 행동 메뉴

1. Recommended: PR을 열기 전 `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, frontend build, final focused backend tests를 실행한다.
2. Follow-up: PR 5/6 Catalog 등록 PR이 `storage_uri`를 remote/object URI로만 제공하면 M6/DuckDB의 remote read 또는 M5 local fallback materialization 방식을 별도 Phase에서 결정한다.
3. Stop: RAG/LLM production 확장, 권한 full policy, dashboard build가 요구되면 별도 Phase로 분리한다.
