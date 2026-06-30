# Product Health Manual Run contract 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Product Health Target Dataset run 응답에 PR 4/5B/6/7/8 공유용 `execution_result.product_health_manual_run_contract` pending handoff block을 추가했다. `docs/03`, `docs/05`, `docs/06`, `docs/07`에 계약, acceptance, regression, manual verification 기준을 반영했다.
- Verified: `PYTHONPATH=backend pytest backend/tests/test_target_dataset_run_handoff.py backend/tests/test_target_dataset_job_draft.py backend/tests/test_product_health_processing_template.py -q` -> `11 passed`; `scripts/validate-harness.sh` -> passed; `scripts/validate-harness.sh --strict` -> passed.
- Remaining: PR 4 snapshot lookup 실제 연결, PR 5B Product Health Gold parquet 생성, PR 6 Catalog 등록, PR 7 AI Query, PR 8 Dashboard 저장은 후속 PR 범위다. `origin/main`이 `6089c725`까지 advance되어 branch sync merge/rebase는 사람 확인 뒤 진행해야 한다.
- Next context: PR 5B는 `source_snapshot_inputs[].source_dataset_id`로 latest successful snapshot을 찾고, `gold_output`, `quality_results`, `lineage`, `catalog_payload`를 실제 성공/실패 값으로 채운다.
- Risk: #310 Gold v2가 main에 merge되었으므로, 사람 승인 후 main sync를 적용하고 `contracts/product_health_*.sample.json`의 v2 schema/version/allowed columns를 이 service가 따라가는지 focused tests를 재실행해야 한다.
