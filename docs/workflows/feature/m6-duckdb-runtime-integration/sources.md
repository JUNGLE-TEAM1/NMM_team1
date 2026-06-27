# M6 DuckDB runtime integration source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `origin/main` at `80945a8` includes merged M6 Step 1 `feature/m6-sql-context` and Step 2 `feature/m6-duckdb-sql-engine`.
- This Phase does not merge another active feature branch; it integrates the already-merged DuckDB adapter into the runtime container.

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `origin/main` | n/a | `80945a8aa15055d12bb2edc08ac5d28ac3b559e0` | 2026-06-27 | Base contains PR #196 `feature/m6-duckdb-sql-engine`; no extra source branch merge needed. |
| `feature/m6-sql-context` | `docs/workflows/feature/m6-sql-context` | merged into `origin/main` before this Phase | 2026-06-27 | Provides `SqlEngineContext.local_fallback_path` and missing-path guardrail context. |
| `feature/m6-duckdb-sql-engine` | `docs/workflows/feature/m6-duckdb-sql-engine` | merged into `origin/main` as `80945a8` | 2026-06-27 | Provides `DuckDBSqlEngine` adapter and focused engine tests. |

## Integration Notes / 통합 메모

- Runtime integration should only switch `AppContainer` engine selection and tests; M6 service continues to depend on `SqlEngineAdapter`.
