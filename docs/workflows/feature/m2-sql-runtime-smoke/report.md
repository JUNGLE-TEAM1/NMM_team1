# M2 SQL runtime smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-sql-runtime-smoke`, `docs/workflows/feature/m2-sql-runtime-smoke`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/workflows/feature/m2-minio-object-upload/report.md`, `docs/workflows/docs/m6-sql-first-week2-buildup/report.md`, current `SqlEngineAdapter`, `FakeSqlEngine`, `Week2AIQueryService`, `Week2WorkflowService`
- Escalated context read: `docs/03-interface-reference.md` Week 2 SQL adapter boundary, `docs/06-regression-and-failure-scenarios.md`, `contracts/catalog_metadata.sample.json`
- Context omitted intentionally: Trino/Athena docs, production S3 object query, M6 RAG/LLM planner internals, Airflow DAG SQL task implementation
- Changed: `DuckDBSqlEngine`를 `SqlEngineAdapter` 뒤에 추가하고, local Parquet/JSONL fallback path를 SQL table처럼 조회하는 runtime smoke를 구현했다. `Settings.week2_sql_engine="duckdb"` opt-in을 추가해 기본 API fake 동작은 유지했다. 수동 smoke script와 regression tests, dependency, 최소 Source of Truth 문구를 갱신했다.
- Verified: TDD 실패를 먼저 확인했고, focused tests 5개, 관련 AI query/workflow tests 32개, 전체 backend tests 77개, smoke script, script syntax, `git diff --check`, `scripts/validate-harness.sh --strict`를 통과했다.
- Remaining: remote CI 확인. 기본 API engine을 `duckdb`로 바꾸는 결정은 M6 SQL MVP integration으로 보류했다.
- Next context: PR 이후 M6는 `Settings.week2_sql_engine="duckdb"` 또는 직접 주입 방식으로 실제 `QueryResult.engine=duckdb` 결과를 UI/API 흐름에 붙일 수 있다.
- Risk: SQL parser는 MVP guardrail 수준이다. 복잡한 generated SQL, JOIN, WHERE column allowlist 확장은 M6 SQL planner 단계에서 별도 보강이 필요하다.
