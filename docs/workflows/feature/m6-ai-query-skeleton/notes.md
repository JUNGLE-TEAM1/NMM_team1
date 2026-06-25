# M6 AI Query 스켈레톤 노트

## 진행 메모

- `feature/m6-ai-query-skeleton` branch와 GitHub issue #100 생성 완료.
- Project 추가는 `gh` token scope 부족으로 실패했으며 `sync.md`에 기록됨.
- M6 skeleton은 `contracts/catalog_metadata.sample.json`을 읽어 fixture 기반 retrieval/template SQL을 수행한다.
- `POST /api/week2/ai/query` route를 추가해 M1이 `AIQueryResult` shape를 바로 소비할 수 있게 했다.
- 실제 DuckDB/LLM/vector RAG는 이번 Phase 범위에서 제외했다.

## 결정

- 2주차 M6 첫 구현은 `Metadata Retrieval + template SQL + fake SqlEngineAdapter`로 시작한다.
- `column_not_allowed` failure code를 추가해 `CatalogMetadata.query.allowed_columns` 위반을 명확히 구분한다.

## 열린 질문

- M3/M5가 실제 `CatalogMetadata`와 Parquet/local fallback path를 확정하면 fake SQL engine을 DuckDB adapter 구현체로 교체해야 한다.
- Day 4에 검증 질문 3개와 정답 SQL을 실제 schema/catalog 기준으로 확정해야 한다.

## 링크 / 증거

- GitHub issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/100
- Focused test: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> 4 passed
- Backend tests: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests -q` -> 22 passed
