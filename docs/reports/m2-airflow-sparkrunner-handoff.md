# M2 Airflow SparkRunner handoff 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: M5 Airflow DAG task가 호출할 수 있는 M2 SparkRunner handoff CLI를 추가했다. CLI는 `RuntimeConfig` profile을 실행하고 `Week2AirflowAdapter`가 읽는 `week2_result` artifact를 저장한다. `contracts/runtime_config.sample.json`, `docs/03`, `docs/07`, focused test와 workspace evidence를 갱신했다.
- Verified: TDD 실패 먼저 확인, focused test `1 passed`, Airflow adapter/workflow focused tests `22 passed`, backend full tests `96 passed` with escalated PySpark execution, CLI smoke succeeded, `runtime_config.sample.json` JSON validation passed, py_compile passed, `git diff --check` passed, harness/strict validation passed.
- Remaining: 실제 Airflow DAG 내부에서 이 CLI를 호출하는 작업은 M5 소유 후속 작업이다. Spark direct `s3a://` write는 다음 M2 Phase다.
- Next context: M5는 Airflow DAG task에서 `PYTHONPATH=backend python scripts/week2_m2_airflow_sparkrunner_handoff.py --runtime-profile airflow_sparkrunner_handoff --run-id <run_id> --result-path data/week2/_airflow_results/<run_id>.json` 형태로 호출하면 된다.
- Risk: 이번 작업은 artifact handoff smoke다. Airflow scheduler/container, Product Health 5GB, direct S3 write를 증명하지 않는다.

---

## Phase

- Type: feature
- Branch/work location: `feature/m2-airflow-sparkrunner-handoff`, `docs/workflows/feature/m2-airflow-sparkrunner-handoff`
- Date: 2026-06-29
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/07-manual-verification-playbook.md`
- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m5-airflow-integration-options.md`

## Goal / 목표

- M5 Airflow가 M2 runner를 호출할 때 필요한 result artifact 경계를 M2 쪽에서 재현 가능하게 제공한다.

## Changed Files / 변경 파일

- `scripts/week2_m2_airflow_sparkrunner_handoff.py`
- `backend/tests/test_week2_airflow_sparkrunner_handoff.py`
- `contracts/runtime_config.sample.json`
- `docs/03-interface-reference.md`
- `docs/07-manual-verification-playbook.md`
- `docs/workflows/feature/m2-airflow-sparkrunner-handoff/*`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_airflow_sparkrunner_handoff.py -q
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_airflow_sparkrunner_handoff.py backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py -q
PYTHONPATH=backend .venv/bin/python -m py_compile scripts/week2_m2_airflow_sparkrunner_handoff.py backend/app/services/week2_airflow_adapter.py backend/app/services/week2_spark_runner.py
jq -e . contracts/runtime_config.sample.json
PYTHONPATH=backend .venv/bin/python scripts/week2_m2_airflow_sparkrunner_handoff.py --runtime-profile airflow_sparkrunner_handoff --run-id run_airflow_spark_001 --result-path data/week2/_airflow_results/run_airflow_spark_001.json
```

## Manual Verification / 수동 검증

- Result: CLI smoke succeeded.
- Evidence: generated artifact contained `week2_result.status=succeeded`, input `4 rows` / `580 bytes`, output `4 rows` / `1,898 bytes`, and a Parquet `output_path`.

## Failed / Incomplete / Follow-Up TODO

- M5 must wire this CLI into a real Airflow DAG task if Airflow-internal SparkRunner invocation is required.
- Product Health 5GB handoff must wait for Product Health input and M3 TransformSpec readiness.
- Spark direct `s3a://` write is intentionally split into the next M2 Phase.

## Secret / Migration / Env Check

- Secret check: no secret added.
- Migration/data change: no migration. Generated `data/week2` outputs are local evidence only.
- Env change: no new dependency. The CLI uses the existing backend Python path and `Week2SparkRunner`.

## Final Judgment / 최종 판단

- Done: yes for M2-owned Airflow SparkRunner handoff artifact.
- Remaining risk: not a real Airflow container or S3 direct write proof.
