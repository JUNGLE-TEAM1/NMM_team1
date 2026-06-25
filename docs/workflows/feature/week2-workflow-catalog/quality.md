# Week 2 Workflow Catalog 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed
- Source Of Truth impact: `docs/03-interface-reference.md` Week 2 execution metric semantics locked; `contracts/workflow_definition.sample.json`, `contracts/execution_result.sample.json`, `contracts/catalog_metadata.sample.json` updated
- Harness test impact: none

## TDD Plan / TDD 계획

- Applies: yes
- Reason: Week 2 M5 API contract와 fallback-compatible run state는 M1/M6 integration boundary라 regression risk가 있다.
- Failing test first: not captured; focused contract tests were added with the implementation in this turn.
- Expected failure command/result: not captured
- Pass command/result: `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q` -> 12 passed; `PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q` -> 30 passed; `scripts/validate-harness.sh --strict` -> passed
- Refactor notes: 기존 baseline `PipelineService`와 분리해 Week 2 fixture slice를 `Week2WorkflowService`에 격리했고, runner boundary는 `Week2LocalRunner`로 분리했다. #92에서 local JSONL demo fixture를 읽어 metrics를 계산하도록 확장했다. #93에서 catalog update 조건을 successful run status로 명시했다. #94에서 `Week2AirflowAdapter` boundary와 Airflow fallback threshold를 추가했다. metric contract lock slice에서 `ExecutionResult` top-level metrics는 input 기준, `CatalogMetadata.metrics`는 output 기준으로 분리했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `jq -e . contracts/*.sample.json >/dev/null` | passed | 6개 fixture JSON 유효성 확인 |
| unit/focused test | `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q` | passed | 12 passed |
| integration/contract test | `PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q` | passed | 30 passed |
| evidence run | `PYTHONPATH=backend ./.venv/bin/python -c "...Week2WorkflowService..."` | passed | `ExecutionResult.row_count=4`, `ExecutionResult.bytes=580`, `CatalogMetadata.metrics.row_count=3`, `CatalogMetadata.metrics.bytes=195`, local fallback path created |
| day2 smoke report | `docs/reports/m5-day2-smoke-evidence.md` | passed | `ExecutionResult`, `CatalogMetadata`, output path, blocked issue, next first action recorded |
| build/typecheck | not run | skipped | 별도 typecheck/build command 없음 |
| harness validation | `scripts/validate-harness.sh` | passed via strict | strict validation에 포함 |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes before PR
- CI result: local equivalent backend/harness validation passed; remote CI/push/PR은 사람 확인 전 실행하지 않음.
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: runtime route is additive under `/api/week2`; rollback is removing the new router/service/tests.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| frontend build | frontend 변경 없음 | not needed |
| real Airflow/MinIO smoke | 이번 slice는 Airflow adapter boundary와 local JSONL fallback 검증이며 실제 외부 Airflow/MinIO 연결은 범위 제외 | not needed |
