# M2 Workflow runner 연동 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: `executor=spark_runner`는 M5 workflow API와 M2 runner boundary를 잇는 integration contract라 regression risk가 있다.
- Failing test first: `backend/tests/test_week2_workflow_catalog.py`에 spark_runner API 실행 test를 먼저 추가한다.
- Expected failure command/result: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_workflow_catalog.py -q` -> failed, `spark_runner` 요청이 `422`로 거부됨.
- Pass command/result: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_workflow_catalog.py -q` -> 16 passed.
- Refactor notes: `Week2WorkflowService`에 `Week2SparkRunner` 의존성과 `RuntimeConfig` 생성 경로를 추가했다. 기존 `local_runner`와 `airflow` 경로는 유지했다.
- CI fix note: PR #167 첫 `container-smoke`에서 Docker image 안의 sample fixture 경로가 `/app/samples`로 달라져 `spark_runner`가 입력을 찾지 못했다. `Week2SparkRunner`에 input sample fallback을 추가하고 regression test를 고정했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace error 없음 |
| unit/focused test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_spark_runner.py -q` | passed | 18 passed |
| integration/contract test | `PYTHONPATH=backend .venv/bin/pytest backend/tests -q` | passed | 51 passed |
| contract JSON validation | `jq -e . contracts/source_config.sample.json contracts/schema_definition.sample.json contracts/transform_spec.sample.json contracts/runtime_config.sample.json contracts/kafka_topic_contract.sample.json contracts/workflow_definition.sample.json contracts/execution_result.sample.json contracts/catalog_metadata.sample.json contracts/ai_query_result.sample.json >/dev/null` | passed | all Week 2 sample JSON files valid |
| build/typecheck | not run | skipped | backend focused/full tests cover this Python-only change; frontend 변경 없음 |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed after source branch records were added |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, when PR opens
- CI result: PR #167 initial `migration-schema-security` failed because PR body lacked `API/schema 영향`; PR body fixed and rerun passed. Initial `container-smoke` failed because Docker sample fixture path differed from local repo path; code fallback fix pushed after local regression passed.
- Deploy/publish required: no
- Deployment confirmation:
- Rollback/smoke notes:

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| frontend build | frontend/UI 변경 없음 | n/a |
| real Spark cluster smoke | 이번 PR은 local `pyarrow` Parquet runner boundary 연결이며 distributed Spark 실행은 후속 작업 | n/a |
| Airflow DAG spark invocation | 이번 PR은 direct `executor=spark_runner` 경로만 연결하고 Airflow DAG 내부 실행은 후속 M5 작업 | n/a |
| local Docker build | `docker build -f infra/docker/backend.Dockerfile ...`가 base image metadata 조회 단계에서 장시간 대기해 취소. GitHub Actions container-smoke rerun으로 확인한다. | n/a |
