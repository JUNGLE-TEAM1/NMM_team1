# M2 SQL runtime smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-sql-runtime-smoke`, `docs/workflows/feature/m2-sql-runtime-smoke`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/workflows/feature/m2-minio-object-upload/report.md`, `docs/workflows/docs/m6-sql-first-week2-buildup/report.md`, `docs/workflows/feature/m6-duckdb-sql-engine/report.md`, current `SqlEngineAdapter`, `FakeSqlEngine`, `DuckDBSqlEngine`, `Week2AIQueryService`, `Week2WorkflowService`
- Escalated context read: `docs/03-interface-reference.md` Week 2 SQL adapter boundary, `docs/06-regression-and-failure-scenarios.md`, `contracts/catalog_metadata.sample.json`
- Context omitted intentionally: Trino/Athena docs, production S3 object query, M6 RAG/LLM planner internals, Airflow DAG SQL task implementation
- Changed: PR #196으로 main에 들어온 M6 `DuckDBSqlEngine` 구현을 기준으로 충돌을 해결했다. 이 branch는 `Settings.week2_sql_engine="duckdb"` opt-in, M2 SQL runtime smoke script, opt-in API regression test, 최소 Source of Truth 문구만 남긴다.
- Verified: TDD 실패를 먼저 확인했다. M6 main merge 후 focused tests 5개, smoke script, script syntax, `git diff --check`, 전체 backend tests 77개, `scripts/validate-harness.sh --strict`를 통과했다.
- Remaining: conflict-resolution merge commit push, remote CI 확인. 기본 API engine을 `duckdb`로 바꾸는 결정은 M6 SQL MVP integration으로 보류했다.
- Next context: PR 이후 M2/M6는 `Settings.week2_sql_engine="duckdb"` 또는 직접 주입 방식으로 실제 `QueryResult.engine=duckdb` 결과를 API/UI 흐름에 붙일 수 있다.
- Risk: SQL engine 구현은 M6 소유다. M2는 engine 내부를 재정의하지 않고 runtime wiring과 smoke evidence만 유지해야 한다.
