# Catalog AI Query runtime E2E 계획

## 목표

Gold output을 CatalogDataset으로 등록하고, AI Query가 실제 CatalogDataset context와 SQL/runtime evidence를 읽어 질의할 수 있게 end-to-end로 연결한다.

## 상태

- 2026-06-30: 계획 생성. Catalog/AI Query 경로는 구현되어 있지만 runtime-generated Gold output과 live catalog 연결을 다시 검수해야 한다.

## 범위

- succeeded Gold Run만 Catalog 등록.
- Catalog metadata에 schema, local path, MinIO URI, row count, bytes, lineage 저장.
- AI Query dataset selector/readiness가 live CatalogDataset을 기준으로 표시.
- read-only SQL/evidence query 검수.

## 제외 범위

- RAG/vector DB 추가.
- LLM external API 호출 추가.
- CatalogDataset destructive update/delete.
- production S3 query engine 전환.

## 선행 조건

- Gold Dataset runtime materialization.
- Jobs/Runs runtime integration.
- M6 DuckDB SQL engine.

## 구현 대상 파일 예상

- `backend/app/services/ai_query.py`
- `backend/app/services/catalog_retriever.py`
- `backend/app/adapters/sqlite_catalog_metadata_source.py`
- `frontend/src/app/App.jsx`
- backend/frontend tests for live CatalogDataset context

## Acceptance Criteria

- runtime Gold output이 CatalogDataset으로 등록된다.
- Catalog detail에서 storage/lineage/schema/evidence가 보인다.
- AI Query가 등록된 CatalogDataset을 선택하거나 자동 감지한다.
- 대표 질문이 read-only SQL/evidence 결과를 반환한다.

## Regression / Failure Scenario

- prepared fixed dataset만 읽고 live CatalogDataset을 무시하면 실패다.
- Gold가 아닌 Source/Silver output이 Catalog 대표 dataset으로 등록되면 실패다.
- SQL query가 write/update/delete를 허용하면 실패다.

## Manual Verification

1. Gold Run을 성공시킨다.
2. Catalog에 등록한다.
3. Catalog detail의 metadata를 확인한다.
4. AI Query에서 대표 질문을 실행한다.

## Report 기준

- `docs/reports/catalog-ai-query-runtime-e2e.md`에 catalog id, query result, evidence path를 기록한다.
