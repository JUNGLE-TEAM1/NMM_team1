# M2 L6 preview runner adapter 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-l6-preview-runner-adapter`, `docs/workflows/feature/m2-l6-preview-runner-adapter`
- Date: 2026-06-28
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/03-interface-reference.md`, `docs/08-development-workflow.md`, `docs/12-quality-gates.md`
- Escalated context read: `docs/reports/m3-expanded-layer-contract/layers/l6-spec-compiler.md`, `tools/m3_contract/l6_compiler.py`, `docs/reports/m2-product-health-runtime-smoke.md`, `backend/app/services/week2_spark_runner.py`
- Context omitted intentionally: Docker Spark cluster, Airflow DAG wiring, 5GB Product Health run은 이번 adapter Phase 범위가 아니라 후속으로 남겼다.
- Changed: `RuntimeConfig`가 `transform_spec` / `transform_spec_path`를 받을 수 있게 했고, `Week2SparkRunner`에 M3 L6 preview-only spec 실행 분기를 추가했다. `select`, `rename`, `cast`, `parse_timestamp`, `normalize_null`, `json_string`, `mask`, `drop`, `aggregate`를 지원하고 unsupported operation은 failed result로 반환한다.
- Verified: TDD failing test first 확인, focused runner test 8 passed, contract sample smoke succeeded, contract JSON validation passed, backend full tests 76 passed with escalation, compileall passed, diff check passed, harness/strict harness validation passed.
- Remaining: 실제 Product Health `gold_product_health` L6 spec 실행, 5GB input evidence, Docker Spark cluster, Airflow DAG 내부 SparkRunner 호출은 후속 작업이다.
- Next context: M3는 실제 L6 spec을 확정하고, M2는 같은 runner 경로에 spec/input만 바꿔 Silver/Gold preview evidence를 만들 수 있다. M5는 `transform_spec_path` 또는 inline `transform_spec`를 `RuntimeConfig`로 넘기는 호출 방식을 맞추면 된다.
- Risk: 현재 실행은 local pyarrow 기반 preview adapter다. 분산 Spark 성능, 전체 L6 action vocabulary, production write, 품질 gate 판정은 증명하지 않는다.
