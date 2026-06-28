# M2 L6 preview runner adapter 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Changed: `RuntimeConfig.transform_spec` / `transform_spec_path`를 추가하고, `Week2SparkRunner`가 M3 L6 preview-only spec을 받아 local preview Parquet와 `Week2RunnerResult` 호환 evidence를 만들 수 있게 했다. 지원 operation은 `select`, `rename`, `cast`, `parse_timestamp`, `normalize_null`, `json_string`, `mask`, `drop`, `aggregate`로 제한하고, unsupported operation은 failed result로 반환한다.
- Verified: TDD failing test first 확인, `backend/tests/test_week2_spark_runner.py` 8 passed, `contracts/runtime_config.sample.json` L6 preview smoke succeeded, `jq -e . contracts/*.sample.json`, backend tests 76 passed with escalation, `git diff --check`, compileall, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`.
- Remaining: 실제 Product Health `gold_product_health` L6 spec 실행, 5GB input evidence, Docker Spark cluster, Airflow DAG 내부 SparkRunner 호출은 후속 작업이다.
- Next context: M3는 실제 L6 spec 의미와 compiler validation을 계속 소유한다. M2는 spec/input을 받아 preview 실행과 row/bytes/duration/output evidence를 만들고, M5는 inline `transform_spec` 또는 `transform_spec_path`를 `RuntimeConfig`에 넘기면 된다.
- Risk: 현재 경로는 local pyarrow preview adapter다. 분산 Spark 성능, production write, 전체 action vocabulary, M3 L7-L9 quality gate는 증명하지 않는다.

## Phase

- Type: feature
- Branch/work location: `feature/m2-l6-preview-runner-adapter`, `docs/workflows/feature/m2-l6-preview-runner-adapter`
- Date: 2026-06-28
- Workspace state: ready-for-review

## Reference Docs

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/reports/m3-expanded-layer-contract/layers/l6-spec-compiler.md`
- `docs/reports/m2-product-health-runtime-smoke.md`

## Goal

- M3 L6 preview-only spec을 M2 runner가 소비할 수 있는 첫 실행 경로를 만든다.
- M2가 transform semantics를 새로 정의하지 않고, spec에 명시된 deterministic operation만 preview로 실행한다.

## Changed Files

- `backend/app/domain/runtime_config.py`
- `backend/app/services/week2_spark_runner.py`
- `backend/tests/test_week2_spark_runner.py`
- `contracts/runtime_config.sample.json`
- `docs/03-interface-reference.md`
- `docs/workflows/feature/m2-l6-preview-runner-adapter/*`

## Implementation Summary

- `RuntimeConfig`에 inline `transform_spec`와 file-based `transform_spec_path`를 추가했다.
- `Week2SparkRunner`가 spec이 있으면 L6 preview adapter로 분기하고, 없으면 기존 single-input 및 `source_inputs[]` pass-through 경로를 유지한다.
- Silver preview용 row-level operation과 Gold preview용 `count`/`avg` aggregate operation을 구현했다.
- 지원하지 않는 operation은 성공으로 위장하지 않고 failed `Week2RunnerResult`로 반환한다.

## Verification Commands

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q
PYTHONPATH=backend .venv/bin/python -c 'import json; from app.domain.runtime_config import RuntimeConfig; from app.services.week2_spark_runner import Week2SparkRunner; payload=json.load(open("contracts/runtime_config.sample.json", encoding="utf-8"))["l6_preview_runtime_smoke"]; result=Week2SparkRunner().run(RuntimeConfig.model_validate(payload), run_id="run_l6_preview_contract_smoke_001"); print(json.dumps(result.__dict__, ensure_ascii=False, sort_keys=True))'
jq -e . contracts/*.sample.json
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q
git diff --check
.venv/bin/python -m compileall backend/app scripts
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence

- Workspace file: `docs/workflows/feature/m2-l6-preview-runner-adapter/quality.md`
- Quality gate status: passed
- TDD status: applied. 새 L6 tests가 먼저 실패했고 기존 runner가 `transform_spec`을 무시하는 상태를 확인한 뒤 구현했다.
- CI/check result: local checks passed. Remote CI는 PR 생성 후 확인한다.
- Skipped checks: Docker Spark cluster, Airflow DAG-internal SparkRunner invocation, 5GB Product Health input run.
- CD/deploy gate: not required.

## Regression Guard

- Checked feature: existing single-input `Week2SparkRunner`, `source_inputs[]` Product Health pass-through, storage output path, backend test suite.
- Protected behavior: 기존 runner 경로는 `transform_spec`이 없으면 그대로 동작해야 한다.
- Result: passed.

## Manual Verification

- Environment: local `.venv`, repository sample JSONL fixture.
- Result: `contracts/runtime_config.sample.json`의 `l6_preview_runtime_smoke` 실행 성공.
- Evidence: input 3 rows, input 469 bytes, output path `data/week2/l6_preview/run_id=run_l6_preview_contract_smoke_001/silver_preview.parquet`, output 3 rows, output 1176 bytes.
- Failure/limitation: sandboxed backend full test는 PySpark local socket bind 제한으로 Taxi Spark test 1개 실패했고, 권한 확장 재실행에서 76 passed.

## docs/05 Acceptance Link

- Related item: Week 2 product risk representative path requires source-level rows/bytes/duration/output evidence and M2 runtime execution handoff.
- Status: partially satisfied for L6 preview adapter.
- Evidence: M2 can now consume L6 preview spec and return `Week2RunnerResult` metrics.

## Document Updates

- Updated: `docs/03-interface-reference.md`, `contracts/runtime_config.sample.json`, branch workspace docs.
- Not updated: `docs/05`, `docs/06`, `docs/07`는 새 acceptance rule을 추가하지 않고 기존 Week2 representative path 안의 runner adapter evidence로 처리했다.

## Failed / Incomplete / Follow-Up TODO

- 실제 Product Health `gold_product_health` L6 spec을 M3 산출물과 맞춰 실행한다.
- 5GB input 묶음이 준비되면 같은 runner 경로로 scale evidence를 만든다.
- Docker Spark cluster와 Airflow DAG 내부 SparkRunner invocation은 별도 Phase로 진행한다.

## Secret / Migration / Env Check

- Secret check: no secret added.
- Migration/data change: no migration. Generated `data/week2/l6_preview/*` output is local evidence and ignored.
- Env change: no new env required.

## Final Judgment

- Done: yes for this M2 L6 preview adapter slice.
- Remaining risk: local preview adapter가 Spark cluster 및 full production ETL을 대체하지 않는다.
