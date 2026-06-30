# Full Browser Demo Smoke 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-07-01
- Changed: C-40 전체 브라우저 데모 smoke를 수행하고 성공 경로와 Hotfix 후보를 분류했다.
- Verified: Product Health Source -> Silver -> Gold Job -> Run -> Catalog -> AI Query 흐름이 실제 브라우저/API evidence로 이어졌다.
- Remaining: demo preflight, 중복 실패 escape CTA, 오래된 문구, 중복 데이터/최신 결과 강조를 Hotfix 후보로 남겼다.
- Next context: 다음 작업은 High/Medium findings를 작은 Hotfix Phase로 쪼개는 것이 좋다.
- Risk: clean demo reset 없이 누적 local metadata 위에서 검수했다.

## Evidence

- Run id: `5b504b44-38cf-4a7b-a35f-3b9968faaeaf`
- CatalogDataset id: `8854ade0-a0c8-4788-9dd2-89bd954dc8f0`
- Gold path: `data/local_sources/product_health/gold/gold_product_health.parquet`
- AI Query selected/evidence/run/path: matched.
- Console errors: none observed.

## Checks

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py backend/tests/test_product_health_source_inventory.py -q
npm --prefix frontend run build
git diff --check
```

## Findings

- High: stale backend/Vite proxy 환경이면 Product Health inventory가 404로 보인다.
- Medium: Gold 중복 저장 실패 후 목록/기존 draft 이동 CTA가 없다.
- Medium: Gold/Jobs 화면에 오래된 “다음 Phase” 실행 문구가 남아 있다.
- Medium: 누적 smoke 데이터가 많아 최신 Product Health run/catalog 식별이 어렵다.
- Low: Silver Review schema preview가 source명을 반복 표시한다.
- Low: Gold Build Jobs 첫 진입이 비어 보이고 refresh 후 표시됐다.

## Final Judgment

- Core path: passed.
- Completion state: passed with findings.
- Next action: demo polish Hotfix 후보 생성.
