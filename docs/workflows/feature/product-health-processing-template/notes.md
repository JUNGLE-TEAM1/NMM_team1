# Product Health Processing Template Notes

## Context Budget

- Mode: Escalate Read
- Reason: M3 contracts, API/schema, frontend wizard, backend persistence 경계가 함께 걸린 integration slice다.

## Read

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `contracts/product_health_transform_spec.sample.json`
- `contracts/product_health_gold_contract.sample.json`
- `contracts/product_health_schema_definition.sample.json`
- `contracts/product_health_risk_score_policy.sample.json`
- `tools/product_health_reference_transform.py`
- `backend/app/services/week2_spark_runner.py`
- `backend/app/domain/runtime_config.py`
- `backend/app/domain/schemas.py`
- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`

## Findings

- M3 Gold Dataset: `dataset_product_health_gold`, query table `gold_product_health`.
- M3 core flow: source bronze read, per-source silver normalize, source-level aggregate, product_id union join, risk_score derive, gold load.
- 현재 Target Dataset wizard의 processing은 `select_fields`만 지원한다.
- 현재 metadata store는 `process_rule` JSON 저장이 가능하므로 nested recommended template 구조를 저장할 수 있다.
- 현재 M2 runner는 Product Health Gold full execution이 아니라 L6 preview/local smoke 경계가 중심이다.
