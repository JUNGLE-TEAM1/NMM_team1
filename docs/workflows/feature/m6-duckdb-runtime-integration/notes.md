# M6 DuckDB runtime integration 노트

## 진행 메모

- 2026-06-27: M6 Step 3로 `AppContainer.create_sql_engine()` 기본값을 `DuckDBSqlEngine`으로 전환했다.
- `WEEK2_SQL_ENGINE=fake` 또는 `Settings(week2_sql_engine="fake")`로 legacy fake smoke/test는 명시 선택할 수 있다.
- Week2 local runner 실행 후 생성된 `CatalogMetadata.storage.local_fallback_path`의 JSONL output을 `/api/week2/ai/query`가 DuckDB로 읽는 것을 테스트와 로컬 API smoke로 확인했다.

## 결정

- 기본 runtime은 Week 2 MVP 계약과 맞게 `duckdb`로 둔다.
- fake engine은 fallback 기본값이 아니라 명시 설정된 테스트/legacy smoke용으로만 쓴다.

## 열린 질문

- 없음. SQL planner 고도화, RAG, LLM 연결은 후속 Step으로 남긴다.

## 링크 / 증거

- Linked issue: #203
- Local API smoke: `query_result.engine="duckdb"`, top rating row `B003`, output row count 3.
