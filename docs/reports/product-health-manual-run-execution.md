# Product Health Manual Run execution 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Product Health Target Dataset Manual Run이 `source_snapshots[]` parquet artifact를 받아 `gold_product_health.parquet`를 생성하고, `product_health_manual_run_contract`의 `gold_output`, `quality_results`, `lineage`, `catalog_payload`를 실제 값으로 채운다.
- Verified: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_target_dataset_run_handoff.py -q` -> `5 passed`; 관련 backend/contract 묶음 -> `30 passed`; `scripts/validate-harness.sh --strict` -> passed.
- Remaining: PR 4 latest snapshot lookup 저장소, PR 6 Catalog 등록, PR 7 AI Query 연결, PR 8 Dashboard 저장은 후속 PR 범위다.
- Next context: PR 6은 `catalog_payload.status=ready_for_catalog_registration`인 Product Health run만 등록 대상으로 삼아야 한다. snapshot이 없으면 `failed_product_health_execution`과 `error.code=MISSING_SOURCE_SNAPSHOT`이 내려간다.
- Risk: 이번 실행은 local parquet artifact 기반 API 실행 경계다. PostgreSQL/MongoDB/Kafka 직접 ingest, distributed Spark/Airflow 실행, Catalog persistence 완료를 주장하지 않는다.

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/product-health-manual-run-execution`, `docs/workflows/feature/product-health-manual-run-execution`
- Date: 2026-06-30
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Goal / 목표

- PR 5A의 pending Product Health Manual Run 계약을 실제 snapshot artifact 실행 결과로 채운다.
- snapshot이 없거나 잘못된 경우 성공처럼 보이지 않는 실패 evidence를 남긴다.

## Implementation Summary / 구현 요약

- `TargetDatasetRunCreate`에 Product Health용 `source_snapshots[]` 입력 계약을 추가했다.
- Product Health `process_rule.type=product_health_gold_pipeline` run은 Week2 reviews fixture 대신 Product Health 전용 execution service로 분기한다.
- parquet snapshot을 role별로 읽어 M3 Gold Contract v2 schema 순서의 `gold_product_health.parquet`를 생성한다.
- 성공 시 `catalog_payload.status=ready_for_catalog_registration`, 실패 시 `failed_product_health_execution`과 error code를 저장한다.

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/product-health-manual-run-execution/quality.md`
- Quality gate status: passed
- TDD status: applied to Product Health success/failure run contract tests
- CI/check result: local passed; GitHub CI not run until PR creation
- Skipped checks: frontend build and browser smoke skipped because this is backend API/runtime contract only

## Regression Guard / 회귀 보호

- Checked feature: 일반 Target Dataset run handoff
- Protected behavior: `select_fields` Target run still uses Week2 fixture output and does not get Product Health contract.
- Result: covered by `backend/tests/test_target_dataset_run_handoff.py`

## Failure Scenario / 실패 시나리오

- Reviewed failure: Product Health snapshot 없이 run이 성공처럼 보이는 경우
- Expected behavior: `status=failed`, `product_health_manual_run_contract.status=failed_product_health_execution`, `error.code=MISSING_SOURCE_SNAPSHOT`
- Verification: `test_product_health_target_dataset_run_fails_without_source_snapshots`
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-4 항목 갱신
- Environment: local API test client with SQLite metadata store and parquet temp files
- Result: automated API smoke passed
- Failure/limitation: live browser smoke not executed in this PR

## Secret / Migration / Env Check

- Secret check: snapshot metadata does not include password, connection string, or raw secret.
- Migration/data change: no DB migration; SQLite stores existing JSON execution result.
- Env change: no new env var.

## Final Judgment / 최종 판단

- Done: Product Health Manual Run execution contract and local parquet artifact path are implemented and tested.
- Remaining risk: PR 4/6/7/8 integration still needs end-to-end verification after merge.
