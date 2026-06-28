# M2 product health runtime smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Changed: `RuntimeConfig.source_inputs[]`와 `Week2SparkRunner` multi-source pass-through 실행을 추가해 reviews/behavior/delivery/product raw input을 source별 Parquet output과 `Week2RunnerResult` 호환 evidence로 남기게 했다. Product Health sample JSONL 4종과 재실행 CLI를 추가했고, `contracts/runtime_config.sample.json` 및 `docs/03-interface-reference.md`에 additive contract를 반영했다.
- Verified: failing test first 확인, `backend/tests/test_week2_spark_runner.py` 5 passed, Product Health runtime CLI smoke succeeded, `jq -e . contracts/*.sample.json`, backend 전체 테스트 73 passed, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `.venv/bin/python -m compileall backend/app scripts/week2_m2_product_health_runtime_smoke.py`
- Remaining: M3 L6 `TransformSpec` 실제 실행, `gold_product_health` 최종 집계, Docker Spark cluster, 5GB input evidence, Airflow DAG 내부 SparkRunner 호출은 후속 작업이다.
- Next context: M2는 이제 여러 raw source를 같은 run에서 읽고 source별 Parquet/evidence를 만들 수 있다. M3는 이 경로 위에 Bronze/Silver/Gold semantics를 얹고, M5는 directory `output_path`와 source별 `task_results[].output_path` 소비 방식을 확인해야 한다.
- Risk: 현재 실행은 local pyarrow pass-through smoke다. Spark cluster/distributed execution이나 M3 semantic transform을 증명하지 않는다.

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m2-product-health-runtime-smoke`, `docs/workflows/feature/m2-product-health-runtime-smoke`
- Date: 2026-06-28
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/08-development-workflow.md`
- `docs/11-git-sync-policy.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`
- `docs/reports/m3-expanded-layer-contract/l0-l10-design.md`
- `docs/reports/m3-expanded-layer-contract/layers/l1-bronze-envelope.md`

## Goal / 목표

- M2가 Product Health 대표 경로의 여러 raw input을 runtime 차원에서 읽고, 변환 의미 없이 source별 Parquet output과 실행 evidence를 남길 수 있게 한다.

## Changed Files / 변경 파일

- `backend/app/domain/runtime_config.py`
- `backend/app/services/week2_spark_runner.py`
- `backend/tests/test_week2_spark_runner.py`
- `backend/samples/product_health_*_seed.jsonl`
- `scripts/week2_m2_product_health_runtime_smoke.py`
- `contracts/runtime_config.sample.json`
- `docs/03-interface-reference.md`
- `docs/workflows/feature/m2-product-health-runtime-smoke/*`

## Implementation Summary / 구현 요약

- `RuntimeConfig`에 `RuntimeSourceInput`과 `source_inputs[]`를 추가했다.
- 기존 단일 `input_path` 실행은 그대로 유지했다.
- `Week2SparkRunner`가 `source_inputs[]`가 있을 때 source별 read/write task result를 만들고 total row/bytes/duration/output directory를 반환한다.
- Product Health sample 4종과 CLI smoke를 추가했다.
- M3 Bronze/Silver/Gold semantics, `risk_score`, metric 계산은 구현하지 않았다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q
PYTHONPATH=backend .venv/bin/python scripts/week2_m2_product_health_runtime_smoke.py --summary-path data/results/m2_product_health_runtime_smoke/summary.json
jq -e . contracts/*.sample.json
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q
git diff --check
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
.venv/bin/python -m compileall backend/app scripts/week2_m2_product_health_runtime_smoke.py
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m2-product-health-runtime-smoke/quality.md`
- Quality gate status: passed
- TDD status: applied. `source_inputs[]` test failed first because `RuntimeConfig` required single `input_format/input_path`; implementation made it pass.
- CI/check result: local checks passed. Remote CI는 PR 생성 후 확인한다.
- Skipped checks: Docker Spark cluster, 5GB run, Airflow DAG-internal Spark execution.
- CD/deploy gate: not required.

## Regression Guard / 회귀 보호

- Checked feature: existing single-input `Week2SparkRunner`, M5 workflow runner integration, Taxi Spark tests.
- Protected behavior: 기존 단일 `input_path` runner와 M5 `spark_runner` 경로를 깨지 않는다.
- Result: passed. Full backend tests passed with 73 tests when rerun outside sandbox socket restrictions.

## Manual Verification / 수동 검증

- Environment: local `.venv`, repository sample JSONL fixtures.
- Result: Product Health runtime CLI smoke succeeded.
- Evidence: 4 logical sources, 11 total input rows, 1412 input bytes, 6719 output bytes, output directory `data/results/m2_product_health_runtime_smoke/spark_smoke/run_id=run_product_health_runtime_smoke_001`.
- Failure/limitation: sandboxed full backend test hit PySpark local socket bind failure; rerun with escalated local execution passed.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Week 2 product risk representative path requires source별 row count, bytes, duration, output path evidence.
- Status: partially satisfied for M2 runtime smoke.
- Evidence: multi-source runner output records source-level read/write task results and top-level total metrics.

## Document Updates / 문서 업데이트

- Updated: `docs/03-interface-reference.md`, `contracts/runtime_config.sample.json`, branch workspace docs.
- Not updated: `docs/05`, `docs/06`, `docs/07`는 새 acceptance rule을 추가하지 않고 기존 Week2 대표 경로 기준 안의 additive runtime evidence로 처리했다.

## Failed / Incomplete / Follow-Up TODO

- M3 L6 deterministic `TransformSpec` execution adapter.
- `gold_product_health` final Gold generation.
- Docker Spark cluster and 5GB input evidence.
- Airflow DAG-internal SparkRunner invocation with M5.
- Optional MinIO upload evidence for multi-source output.

## Secret / Migration / Env Check

- Secret check: no secret added.
- Migration/data change: no migration. Small sample fixtures added; generated `data/results` output is ignored and not committed.
- Env change: no new env required.

## Final Judgment / 최종 판단

- Done: yes for this M2 runtime smoke slice.
- Remaining risk: This proves multi-source runtime/evidence shape, not distributed Spark, M3 semantics, or 5GB scale.
