# Product Health Source Inventory Binding 보고서

## Short Report / 짧은 보고

- Type: Phase Plan
- Date: 2026-06-30
- Changed: Product Health source inventory API와 Source Dataset wizard 후보 UI를 추가했다. behavior/reviews/product catalog/delivery 원천을 raw/prepared/missing/mismatch로 구분한다.
- Verified: focused backend tests `13 passed`, frontend build passed, `git diff --check` passed, TestClient inventory smoke passed.
- Remaining: browser click-through로 Source Dataset 저장 UX 확인, C-38 Product Health Run execution.
- Next context: C-38에서 Source inventory를 lineage로 삼아 Product Health Gold Run evidence를 닫는다.
- Risk: reviews/delivery는 prepared parquet 후보로 표시되며 외부 raw source로 표현하지 않는다.

## Phase / Hotfix

- Type: Phase Plan
- Branch/work location: `feature/product-health-source-inventory-binding`, `docs/workflows/feature/product-health-source-inventory-binding`
- Date: 2026-06-30
- Workspace state: completed

## Goal / 목표

- Product Health 원천 inventory를 Source Dataset 생성 흐름에 묶는다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_product_health_source_inventory.py backend/tests/test_source_dataset_persistence.py -q
npm --prefix frontend run build
git diff --check
```

## Manual Verification / 수동 검증

- TestClient inventory smoke:
  - `behavior_events`: `raw_file`, `ready`, `source_user_events`, `5668612855` bytes.
  - `reviews`: `prepared_dataset`, `ready`, `source_product_reviews`.
  - `product_catalog`: `raw_file`, `ready`, `source_product_catalog`.
  - `delivery_trip_logs`: `prepared_dataset`, `ready`, `source_delivery_trip_logs`.
