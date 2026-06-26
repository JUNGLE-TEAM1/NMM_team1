# M1 Catalog Live UI notes

## 작업 메모

- `/catalog`와 `/catalog/dataset_reviews_gold`는 각각 직접 진입될 수 있으므로 둘 다 catalog API를 조회한다.
- `getWeek2Catalog()`는 Phase 1에서 만든 Week2 API client를 재사용한다.
- catalog가 없을 때는 fake metadata로 성공처럼 보이지 않고 run 선행 안내를 표시한다.
- run status 화면의 output dataset에서 catalog detail로 이동하는 CTA를 추가했다.
- mid-phase에 `origin/main`이 M5 runner 관련 PR merge로 앞섰지만 frontend 변경과 충돌하는 파일은 없었다.

## 변경 요약

- `CatalogPage`가 `CatalogMetadata` list/summary를 live API payload로 표시한다.
- `CatalogDetailShell`이 lineage, quality, query/governance hint, storage fallback path를 live payload로 표시한다.
- `LineageShell`은 live lineage가 있으면 source/upstream/pipeline/run/dataset 흐름을 표시한다.

