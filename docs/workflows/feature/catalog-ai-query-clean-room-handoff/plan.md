# Catalog AI Query Clean-room Handoff 계획

## 목표

C-38에서 실행한 Product Health Gold 결과를 CatalogDataset으로 등록하고, AI Query가 같은 CatalogDataset을 읽게 한다. 사용자는 “방금 만든 결과를 질문한다”는 흐름을 볼 수 있어야 한다.

## 범위

- C-38 run result를 Catalog publish 입력으로 사용한다.
- CatalogDataset의 run id, local path, schema, metrics, lineage가 run evidence와 일치한다.
- AI Query readiness와 실행 결과가 방금 publish한 CatalogDataset을 선택한다.
- prepared/live/fallback 경로가 UI와 evidence에서 섞이지 않게 한다.

## 제외 범위

- 외부 LLM/RAG/vector DB 추가.
- write SQL.
- full 5GB ETL 재실행.
- 브라우저 전체 demo smoke.

## Acceptance Criteria

- CatalogDataset이 C-38 run id와 output path를 가리킨다.
- AI Query selected dataset/evidence/retrieval trace가 같은 CatalogDataset을 가리킨다.
- Product Health answer panel이 run/catalog/path/schema 근거를 읽기 좋게 표시한다.
- prepared fallback이 최신 run 결과처럼 거짓 표시되지 않는다.

## Regression / Failure Scenario

- AI Query가 오래된 fixed Product Health catalog를 선택하면 실패다.
- Catalog path와 AI Query SQL table path가 다르면 실패다.
- readiness panel이 방금 publish한 dataset 대신 stale fixture를 보여주면 실패다.

## Manual Verification

1. C-38 run을 성공시킨다.
2. `Catalog 등록`을 실행한다.
3. `/catalog`에서 같은 run id/path/schema를 확인한다.
4. `/query`에서 위험 점수 질문을 실행한다.
5. selected dataset/evidence/retrieval trace가 같은 catalog/run을 가리키는지 확인한다.
