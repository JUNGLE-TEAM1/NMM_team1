# Full Browser Demo Smoke 품질 기록

- Quality gate status: passed-with-findings

## TDD Plan

- Applies: no
- Reason: C-40은 browser/manual verification Phase다. 발견 이슈는 Hotfix/후속 Phase에서 테스트와 함께 분리한다.

## Executed Checks

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py backend/tests/test_product_health_source_inventory.py -q
npm --prefix frontend run build
git diff --check
curl -sS http://127.0.0.1:8000/health
```

## Browser Smoke Evidence

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:8000`
- Flow checked: Source inventory -> Source 저장 -> Silver 저장 -> Gold wizard -> Gold Build Job -> Run execute -> Catalog publish -> AI Query.
- Console errors: none observed.
- Run evidence: `run_id=5b504b44-38cf-4a7b-a35f-3b9968faaeaf`, `status=succeeded`, `materialization_mode=prepared_gold_reference`, `output_path=data/local_sources/product_health/gold/gold_product_health.parquet`, `row_count=1000`.
- AI Query evidence: selected CatalogDataset `8854ade0-a0c8-4788-9dd2-89bd954dc8f0`, same run id `5b504b44-38cf-4a7b-a35f-3b9968faaeaf`, same local fallback path.

## Findings

| Severity | Finding | Evidence | Suggested next action |
| --- | --- | --- | --- |
| High | stale server/proxy 상태에서는 Source inventory가 404로 보여 데모 첫 단계가 빈 화면처럼 보인다. | backend direct `8000`은 정상, 기존 Vite proxy는 다른 backend를 보고 있었다. | 데모 시작 스크립트 또는 preflight에서 `VITE_PROXY_TARGET`과 backend route를 확인한다. |
| Medium | Gold 생성 중복 실패 후 목록으로 빠지는 버튼이 없어 reload가 필요했다. | `Target dataset draft name already exists: dataset_product_health` 후 `목록으로` 버튼 없음. | 중복 실패 화면에 목록/기존 draft로 이동 CTA 추가. |
| Medium | Gold/Jobs 화면에 오래된 “다음 Phase에서 실행/trigger 연결” 문구가 남아 있다. | Gold Build 준비/Review, Silver Jobs 문구. | C-38 이후 문구로 수정. |
| Medium | Catalog/Gold 목록에 기존 smoke 데이터와 중복 `dataset_product_health`가 많아 최신 결과 식별이 어렵다. | Gold 6 items, Source 11 items, Catalog에 동일 name 반복. | 데모 reset/cleanup 또는 최신 run 강조. |
| Low | Silver Review schema preview에 `source_user_events` code가 반복되어 field preview로 보기 어렵다. | Review DOM에서 code가 모두 `source_user_events` 반복. | schema preview mapping polish. |
| Low | Gold Build Jobs 첫 진입에서 비어 보였고 새로고침 후 표시됐다. | `실행 준비된 Gold Build Job이 없습니다` 후 refresh로 job cards 표시. | draft list load 실패 복구/부분 로딩 개선. |

## CI/CD Gate

- CI required: yes, when PR opens
- CI result: not run in local phase
- Deploy/publish required: no
