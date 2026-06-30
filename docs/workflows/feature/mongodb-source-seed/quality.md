# MongoDB Source Dataset seed 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: External Connection API contract에 MongoDB schema preview 분기가 추가된다.
- Failing test first: `connection_type=mongodb` create/test/schema preview가 현재 Pydantic validation에서 거부되는 상태를 확인한다.
- Expected failure command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_external_connection_persistence.py -q` -> `3 failed, 4 passed`; MongoDB payload가 `422 Unprocessable Entity`로 거부됨.
- Pass command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py -q` -> `10 passed`.
- Refactor notes: `ExternalSchemaInspector`가 PostgreSQL table과 MongoDB collection preview를 connection type으로 분기한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | no output |
| unit/focused test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py -q` | passed | `10 passed in 1.52s` |
| integration/contract test | MongoDB Docker seed + API smoke | passed | `asklake-mongodb` healthy, seed `500`, test endpoint row estimate `500`, Source Dataset `metadata_ready` |
| build/typecheck | `PYTHONPATH=backend .venv/bin/python -m py_compile scripts/load_jsonl_to_mongodb.py backend/app/services/external_connections.py backend/app/api/source_catalog.py backend/app/adapters/sqlite_metadata_store.py backend/app/domain/schemas.py` | passed | no output |
| frontend build | `npm run build` in `frontend/` | passed | Vite build completed |
| container rebuild | `docker compose -f docker-compose.yml -f docker-compose.mongodb.yml up -d --build frontend` | passed after retry | rebuilt frontend/backend and all containers are up after MongoDB `Test Connection` button visibility fix |
| API smoke after UI fix | `POST /api/external-connections/test` with MongoDB payload | passed | `raw_scope=asklake_demo.customer_events`, `row_count_estimate=500`, `column_count=10` |
| post-merge upstream sync | `git stash push -u`, `git merge --ff-only origin/main`, `git stash pop` | passed | current branch fast-forwarded to `origin/main` `218741b8`, stash popped without conflicts |
| post-merge focused tests | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py backend/tests/test_product_health_processing_template.py backend/tests/test_target_dataset_job_draft.py -q` | passed | `17 passed in 1.40s` |
| post-merge frontend build | `npm run build` in `frontend/` | passed | Vite build completed |
| post-merge compile check | `PYTHONPATH=backend .venv/bin/python -m py_compile scripts/load_jsonl_to_mongodb.py backend/app/services/external_connections.py backend/app/api/source_catalog.py backend/app/domain/schemas.py` | passed | no output |
| post-merge Docker/API smoke | `docker compose -f docker-compose.yml -f docker-compose.mongodb.yml ps`; `POST /api/external-connections/test` with MongoDB payload | passed | `asklake-mongodb` healthy, backend/frontend up, `raw_scope=asklake_demo.customer_events`, `row_count_estimate=500`, `column_count=10` |
| harness validation | `scripts/validate-harness.sh` | failed, unrelated | existing `llm-runtime-settings-ui` workspace missing files; MongoDB workspace issue fixed after first strict run |
| strict harness validation | `scripts/validate-harness.sh --strict` | failed, unrelated | after MongoDB workspace correction, rerun failed with 25 existing `codex/llm-runtime-settings-ui` / `feature/llm-runtime-settings-ui` workspace issues and no MongoDB workspace failures |

## CI/CD Gate / CI-CD 게이트

- CI required: yes for PR
- CI result: local only, remote CI not run
- Deploy/publish required: no
- Deployment confirmation:
- Rollback/smoke notes:

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| full Target run/Catalog/AI Query | 이번 Phase는 실제 MongoDB Source Dataset metadata 등록까지 | not required |
| full collection profiling/nested flattening | 50 sample documents 기반 top-level schema preview로 충분 | not required |
