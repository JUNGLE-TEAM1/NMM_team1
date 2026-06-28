# M6 SQL planner intent rules source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `feature/m6-duckdb-runtime-integration` / PR #204
- `origin/main` as of `e1ddef2`

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
| `feature/m6-duckdb-runtime-integration` | `docs/workflows/feature/m6-duckdb-runtime-integration` | `bad0c9eab12ca6e37e24fc31c16dd73a804fa828` | 2026-06-27 | Step 3 default DuckDB runtime integration; PR #204 later merged into main. |
| `origin/main` | n/a | `e640f902972841fc129b4f53f9a1d009d789ca79` | 2026-06-27 | Main includes M2 SQL runtime smoke and docs that Step 3 resolved against. |
| `origin/main` | n/a | `e15300a` | 2026-06-28 | Main now defines product risk representative path as `dataset_product_health_gold` / `gold_product_health`; Step 4 scope was corrected in place without pull/merge/rebase. |
| `origin/main` | n/a | `e1ddef2` | 2026-06-28 | Main includes PR #228 M2 product health runtime smoke seed inputs; CatalogMetadata sample still uses reviews Gold. |

## Integration Notes / 통합 메모

- PR #204 and PR #228 are merged, and this branch has been rebased onto `origin/main` `e1ddef2` before final PR checks.
- Step 4 keeps the public `AIQueryResult` shape and only adds the additive `unsupported_question` guardrail code to `docs/03`.
- Product health Gold CatalogMetadata/output fixture is not added in this branch; planner support is driven by whatever CatalogMetadata `allowed_columns` exposes.
