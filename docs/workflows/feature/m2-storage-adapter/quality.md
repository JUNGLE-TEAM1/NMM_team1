# M2 MinIO S3-compatible storage adapter 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: storage adapter는 `RuntimeConfig`, runner output path, Catalog storage metadata 경계를 바꾸므로 잘못되면 M3/M5/M6 handoff가 깨진다.
- Failing test first: `backend/tests/test_week2_storage_adapter.py`와 `backend/tests/test_week2_spark_runner.py` storage case를 먼저 추가한다.
- Expected failure command/result: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_spark_runner.py -q` -> failed, `ImportError: cannot import name 'StorageConfig' from 'app.domain.runtime_config'`.
- Pass command/result: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_spark_runner.py -q` -> 4 passed.
- Refactor notes: storage URI/local fallback 계산은 `Week2StorageAdapter`로 분리하고, runner는 adapter가 계산한 local path에만 쓴다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace error 없음 |
| JSON fixture validation | `python3 -m json.tool contracts/runtime_config.sample.json`, `python3 -m json.tool contracts/catalog_metadata.sample.json` | passed | both fixtures valid JSON |
| unit/focused test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_spark_runner.py -q` | passed | 4 passed |
| integration/contract test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_spark_runner.py backend/tests/test_week2_workflow_catalog.py -q` | passed | 20 passed |
| backend suite | `PYTHONPATH=backend .venv/bin/pytest backend/tests -q` | passed | 55 passed |
| manual smoke | `PYTHONPATH=backend .venv/bin/python - <<'PY' ... Week2WorkflowService(...).trigger_run(... spark_runner ...)` | passed | `s3_uri=s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/`, matching local fallback Parquet exists |
| build/typecheck | not run | skipped | Python test suite covers backend/runtime change; frontend 변경 없음 |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, when PR opens
- CI result: 
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| real MinIO upload | 이번 PR은 endpoint/credential 없는 storage path adapter slice다. 실제 object upload는 후속 Phase. | n/a |
| AWS S3 smoke | cloud credential/resource approval이 필요하다. | n/a |
| frontend build | frontend/UI 변경 없음 | n/a |
| PySpark cluster smoke | storage adapter 이후 별도 M2 Spark Phase에서 진행 | n/a |
