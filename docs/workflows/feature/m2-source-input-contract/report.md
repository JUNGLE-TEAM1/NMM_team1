# M2 source input 계약 확장 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Changed: `RuntimeSourceInput`에 `source_type` / `format` / `path`를 추가하고 legacy `input_format` / `input_path`를 유지했다. `Week2SparkRunner`는 `local_file`만 실행하고 미지원 source type은 failed result로 반환한다.
- Verified: TDD 실패 확인 후 focused runner test 7 passed, Product Health runtime smoke passed, `contracts/runtime_config.sample.json` JSON validation passed.
- Remaining: remote branch push, PR creation, 실제 S3/PostgreSQL/MongoDB/Kafka connector, UI source connection, M5 source config 변환.

## Context

- Context Budget mode: Escalate Read.
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `docs/03-interface-reference.md`, `docs/reports/m2-product-health-runtime-smoke.md`, M2 runner/tests.
- Reason: `RuntimeConfig.source_inputs[]`는 M2/M3/M5/M6가 공유하는 interface contract다.
- Linked issue: #233, https://github.com/JUNGLE-TEAM1/NMM_team1/issues/233

## Verification

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q
PYTHONPATH=backend .venv/bin/python scripts/week2_m2_product_health_runtime_smoke.py --summary-path data/results/m2_product_health_runtime_smoke/source_input_contract_summary.json
python3 -m json.tool contracts/runtime_config.sample.json
```
