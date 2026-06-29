# M2 Airflow SparkRunner handoff 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-airflow-sparkrunner-handoff`, `docs/workflows/feature/m2-airflow-sparkrunner-handoff`
- Date: 2026-06-29
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/03-interface-reference.md`, `docs/07-manual-verification-playbook.md`, M2/M5 runner 관련 code/tests
- Escalated context read: `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`, `docs/project-context/asklake-week2-module-plan/ver2/m5-airflow-integration-options.md`, `contracts/runtime_config.sample.json`
- Context omitted intentionally: M1 UI, M6 RAG, real Airflow container E2E, Spark direct S3 write
- Changed: M5 Airflow DAG task가 호출할 수 있는 M2 SparkRunner handoff CLI를 추가했다. CLI는 `RuntimeConfig` profile을 실행하고 `Week2AirflowAdapter`가 읽는 `week2_result` artifact를 저장한다. `contracts/runtime_config.sample.json`, `docs/03`, `docs/07`, focused test와 workspace evidence를 갱신했다.
- Verified: TDD 실패 먼저 확인, focused test `1 passed`, Airflow adapter/workflow focused tests `22 passed`, backend full tests `96 passed` with escalated PySpark execution, CLI smoke succeeded, `runtime_config.sample.json` JSON validation passed, py_compile passed, `git diff --check` passed, harness/strict validation passed.
- Remaining: 실제 Airflow DAG 내부에서 이 CLI를 호출하는 작업은 M5 소유 후속 작업이다. Spark direct `s3a://` write는 다음 M2 Phase다.
- Next context: M5는 Airflow DAG task에서 `PYTHONPATH=backend python scripts/week2_m2_airflow_sparkrunner_handoff.py --runtime-profile airflow_sparkrunner_handoff --run-id <run_id> --result-path data/week2/_airflow_results/<run_id>.json` 형태로 호출하면 된다.
- Risk: 이번 작업은 artifact handoff smoke다. Airflow scheduler/container, Product Health 5GB, direct S3 write를 증명하지 않는다.
