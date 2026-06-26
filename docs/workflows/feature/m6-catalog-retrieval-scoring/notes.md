# M6 Catalog retrieval scoring 노트

## 진행 메모

- `feature/m6-catalog-retrieval-scoring` branch/workspace를 `origin/main` `dee950b` 기준으로 생성했다.
- `CatalogSource` 경계 위에 `CatalogRetriever`를 추가해, 여러 catalog 후보가 있을 때 column alias와 catalog metadata token을 함께 점수화한다.
- 실패 테스트는 같은 query schema를 가진 generic catalog와 Amazon Reviews catalog를 넣고, 질문의 `Amazon reviews` metadata 단서를 기준으로 Amazon catalog가 선택되어야 한다는 케이스다.
- 기존 fixture-backed route, SQL mirror, guardrail tests는 유지했다.

## 결정

- 공유 `AIQueryResult`/`CatalogMetadata` contract는 바꾸지 않는다.
- 이번 retrieval은 external vector DB나 embedding이 아니라 lightweight token/alias scoring으로 제한한다.
- SQL planner는 이번 범위에서 확장하지 않는다. 선택된 catalog가 기존 review query shape를 갖는 경로만 성공 실행 대상으로 유지한다.

## 열린 질문

- M5 실제 Catalog store/API가 나오면 retriever 입력 catalog 목록을 fixture에서 실제 source로 전환한다.
- M3 schema/profile facts가 확정되면 scoring 대상 metadata에 sample values, semantic labels, quality facts를 추가할 수 있다.

## 링크 / 증거

- GitHub issue: #144
- `backend/app/services/catalog_retriever.py`
- `backend/app/services/ai_query.py`
- `backend/tests/test_week2_ai_query.py`
