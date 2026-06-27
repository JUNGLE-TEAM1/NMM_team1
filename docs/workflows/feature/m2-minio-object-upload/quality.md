# M2 MinIO 실제 업로드 smoke 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: storage upload 경계와 SparkRunner task result가 바뀌므로 regression test가 필요하다.
- Failing test first: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_spark_runner.py -q`
- Expected failure command/result: failed with `ImportError: cannot import name 'StorageUploadResult'`
- Pass command/result: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_spark_runner.py -q` -> 6 passed
- Refactor notes: 새 SDK를 추가하지 않고 `httpx` + SigV4 helper로 최소 upload path를 구성했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| syntax | `python3 -m py_compile scripts/week2_m2_minio_upload_smoke.py` | passed | CLI smoke script syntax |
| contract JSON | `python3 -m json.tool contracts/runtime_config.sample.json` | passed | RuntimeConfig fixture valid |
| unit/focused test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_spark_runner.py -q` | passed | 6 passed |
| integration/contract test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_spark_runner.py backend/tests/test_week2_workflow_catalog.py -q` | passed | 22 passed |
| backend full test | `PYTHONPATH=backend .venv/bin/pytest -q` | passed | 67 passed |
| actual MinIO smoke | `env ASKLAKE_DEMO_MINIO_ENDPOINT=http://localhost:19000 ASKLAKE_DEMO_MINIO_ACCESS_KEY=minioadmin ASKLAKE_DEMO_MINIO_SECRET_KEY=minioadmin PYTHONPATH=backend .venv/bin/python scripts/week2_m2_minio_upload_smoke.py --endpoint http://localhost:19000 --auto-create-bucket --summary-path data/results/m2_minio_upload_smoke/summary.json` | passed | status `succeeded`, `spark_upload`, object uri recorded |
| diff whitespace | `git diff --check` | passed | no output |
| PR size local estimate | local `git diff --numstat` estimate | passed | non-evidence tracked files 8 / 10, lines 430 / 600 before staging untracked smoke script |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR checks
- CI result: pending until PR
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| AWS S3 real upload | 이번 Phase는 local MinIO smoke이며 cloud credential/IAM 결정이 없다. | n/a |
| Spark cluster / PySpark distributed execution | M2 후속 Phase로 분리되어 있다. | n/a |
