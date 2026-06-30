# Catalog payload 기반 Catalog 등록 공유 문서

| File | Change | Impact |
| --- | --- | --- |
| `docs/03-interface-reference.md` | `week2_result.catalog_payload` 최소 필드와 `storage_uri` canonical rule 추가 | PR 5A producer와 PR 6 consumer 계약 고정 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Manual Run `catalog_payload.storage_uri` 기준 Catalog 등록 acceptance 추가 | done 기준에 path 추측 금지 포함 |
| `docs/06-regression-and-failure-scenarios.md` | `storage_uri` 무시/추측 회귀 시나리오 추가 | 실패 조건과 테스트 연결 |
| `docs/07-manual-verification-playbook.md` | Airflow result artifact와 Catalog `storage_uri` 확인 절차 추가 | 사람이 PR 5A/PR 6 handoff를 확인 가능 |
| `contracts/execution_result.sample.json` | `catalog_payload` sample 추가 | producer fixture 보강 |
| `contracts/catalog_metadata*.sample.json` | additive `storage_uri`, `format`, `quality_summary`, `m3_contract_refs` 추가 | Catalog consumer fixture 보강 |

## Not updated

- `docs/project-context/asklake-week2-module-plan/ver2/README.md`: existing user modification present; Source of Truth update in `docs/03` is sufficient for this contract.
- `docs/reports/README.md`: existing user modification present; report file is created separately.
