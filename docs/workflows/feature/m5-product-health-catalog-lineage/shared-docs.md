# M5 Product-Health Catalog Lineage Shared Docs

| Document | Change | Impact | Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | product-health fixture, IDs, storage path, SQL context 추가 | M1/M5/M6가 같은 dataset/table/column 계약을 사용한다. | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | M5 product-health Catalog acceptance 추가 | 발표 path의 M5 완료 기준이 명확해진다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | product-health 실패 run overwrite guard 추가 | latest Catalog 안전성이 회귀 기준에 들어간다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | product-health Catalog smoke 추가 | 수동 확인 경로가 생긴다. | 낮음 |

## Handoff

- M6는 `dataset_product_health_gold` Catalog의 `query.table_name=gold_product_health`와 `query.allowed_columns`를 읽으면 된다.
- M2/M3는 실제 runner가 준비되면 `Week2RunnerResult` 호환 `output_path`, `task_results`, `row_count`, `bytes`, `duration_ms`를 M5에 넘긴다.
