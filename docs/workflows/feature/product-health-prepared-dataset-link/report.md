# Product Health 원천별 Source Dataset 연결 보고서

## Phase

- Type: Feature Phase C-15
- Branch/work location: `feature/external-connection-persistence`, `docs/workflows/feature/product-health-prepared-dataset-link/`
- Date: 2026-06-30
- Workspace state: 기존 dirty worktree 위에서 C-15 관련 UI/문서만 수정했다.

## Goal / 목표

- Product Health 원천을 bundle로 묶지 않고 개별 External Connection에서 canonical Source Dataset metadata로 저장되게 한다.

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `docs/08-development-workflow.md`
- `docs/workflows/feature/product-health-prepared-dataset-link/plan.md`
- `docs/workflows/feature/product-health-prepared-dataset-link/quality.md`

## Implementation Summary / 구현 요약

- Source Dataset 생성 wizard에서 connection 선택 시 원천 의미에 맞는 이름을 추천한다.
- 추천 mapping:
  - Amazon/Review/VOC -> `source_product_reviews`
  - MEP/Product Catalog/annotations -> `source_product_catalog`
  - Behavior/Event -> `source_user_events`
  - Taxi/Delivery/Trip -> `source_delivery_trip_logs`
  - Kafka -> `source_order_events`
- Source Dataset 저장 payload는 기존 connection의 `resource`, `resource_label`, `schema_preview`를 그대로 사용한다.
- C-15 계획을 prepared bundle 연결에서 원천별 Source Dataset 연결로 전환했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_external_connection_discovery.py -q
npm run build
git diff --check
```

## Manual Verification / 수동 검증

- `MEP Product JSON` External Connection을 웹에서 생성했다.
- Source Dataset 생성에서 `conn_mep_product_catalog_json` 선택 시 `source_product_catalog` 추천을 확인했다.
- Source Dataset 저장 후 DB에서 `source_product_catalog` metadata를 확인했다.

## Regression Guard / 회귀 보호

- Source Dataset 생성은 계속 External Connection을 입력으로 사용한다.
- 기존 duplicate guard와 downstream delete guard는 `backend/tests/test_source_dataset_persistence.py`로 확인했다.

## Remaining / 남은 일

- Amazon/Behavior/Taxi 원천별 Source Dataset도 같은 흐름으로 저장해 데모 seed를 완성해야 한다.
- 다음 Phase에서 Source Dataset -> Silver Dataset 생성 흐름을 실제 원천별로 확인한다.

## Secret / Migration / Env Check

- Secret check: secret 추가 없음.
- Migration/data change: DB에 수동 smoke 데이터 `conn_mep_product_catalog_json`, `source_product_catalog`가 추가됨.
- Env change: 새 env 없음. 검증용 서버는 종료했다.

## Final Judgment / 최종 판단

- Done: C-15 완료.
- Remaining risk: Source metadata 연결까지이며 실제 row ingest/Silver 변환은 포함하지 않는다.
