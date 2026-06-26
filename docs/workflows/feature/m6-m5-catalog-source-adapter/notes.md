# M6 M5 CatalogSource adapter 노트

## 진행 메모

- `scripts/start-workflow.sh feature m6-m5-catalog-source-adapter "M6 M5 CatalogSource adapter"`로 branch workspace를 생성했다.
- sandbox에서 `.git` ref lock 생성이 막혀 승인된 escalated 실행으로 branch/workspace를 만들었다.
- GitHub issue #146이 생성되었고 Project status update는 `read:project` scope 부족으로 실패했다.
- 테스트를 먼저 추가해 M5 workflow run 두 번 뒤 AI query evidence가 최신 `run_reviews_demo_002`를 써야 함을 고정했다.
- 구현 전 실패는 expected: AI query가 fixture catalog의 `run_reviews_demo_001`을 반환했다.
- `Week2CatalogStoreSource`를 추가해 M5 `Week2CatalogStore.load_catalog()` 결과를 `CatalogSource`로 노출했다.
- app container에서 `Week2CatalogStore`를 공유해 M5 workflow service와 M6 AI query service가 같은 store root를 보게 했다.
- store가 비어 있으면 기존 `FixtureCatalogSource` fallback을 유지한다.

## 결정

- public API/schema/contract 변경 없이 내부 adapter와 container wiring으로 해결한다.
- real SQL runtime, vector DB, real LLM은 이번 slice에서 제외한다.

## 열린 질문

- M5 store가 이후 pagination/auth/session context를 요구하면 `CatalogSource` protocol 확장이 필요할 수 있다.
- workflow run 전 AI query fixture fallback을 장기적으로 계속 둘지는 후속 발표/통합 흐름에서 재검토한다.

## 링크 / 증거

- Linked issue: #146
- Focused test: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q`
- Backend test: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests -q`
