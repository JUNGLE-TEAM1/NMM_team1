# M2 SQL runtime smoke 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: SQL engine runtime boundary가 fake result에서 M6 DuckDB adapter 기반 실제 local file 조회로 확장되므로 opt-in wiring과 AI query integration regression test가 필요하다.
- Failing test first: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_duckdb_sql_engine.py backend/tests/test_week2_ai_query_duckdb.py -q`
- Expected failure command/result: failed with `ModuleNotFoundError: No module named 'app.adapters.duckdb_sql_engine'`
- Pass command/result: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_duckdb_sql_engine.py backend/tests/test_week2_ai_query_duckdb.py -q` -> 5 passed
- Refactor notes: M6 `DuckDBSqlEngine` 구현을 기준으로 충돌을 해결하고, M2는 settings/container opt-in과 smoke evidence만 유지한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| dependency install | `.venv/bin/pip install -r backend/requirements.txt` | passed | M6 main 기준 `duckdb==1.5.4` installed |
| script syntax | `python3 -m py_compile scripts/week2_m2_sql_runtime_smoke.py` | passed | no output |
| unit/focused test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_duckdb_sql_engine.py backend/tests/test_week2_ai_query_duckdb.py -q` | passed | 5 passed |
| integration/contract test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_duckdb_sql_engine.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_week2_ai_query.py backend/tests/test_week2_workflow_catalog.py -q` | passed | 32 passed |
| manual smoke | `PYTHONPATH=backend .venv/bin/python scripts/week2_m2_sql_runtime_smoke.py` | passed | `engine=duckdb`, `row_count=3`, `status=succeeded` |
| backend full test after M6 merge | `PYTHONPATH=backend .venv/bin/pytest -q` | passed | 77 passed |
| diff whitespace | `git diff --check` | passed | no output |
| strict harness validation after M6 merge | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR checks
- CI result: pending until PR
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| production S3/MinIO direct query | 이번 Phase는 local fallback path SQL smoke이며 object store 직접 query는 후속 profile 결정이 필요하다. | n/a |
| Trino/Athena | DuckDB adapter MVP 범위로 제한했다. | n/a |
| M6 SQL planner/RAG | M6 후속 구현 범위다. | n/a |
