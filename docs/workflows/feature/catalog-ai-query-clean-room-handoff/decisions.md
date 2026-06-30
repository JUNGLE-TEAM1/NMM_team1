# Catalog AI Query Clean-room Handoff decisions

- Decision status: accepted

## Accepted Decisions

| Decision | Rationale | Date |
| --- | --- | --- |
| AI Query는 방금 publish한 CatalogDataset을 우선 선택해야 한다. | 데모에서 “방금 만든 결과를 질문한다”는 흐름을 닫기 위해서다. | 2026-06-30 |
| Query evidence에 storage path를 포함한다. | C-39 검수에서 CatalogDataset path와 AI Query SQL context path가 같은지 화면/API에서 확인해야 한다. | 2026-06-30 |

## Deferred Decisions

| Decision | Deferred reason | Revisit trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| external RAG/vector DB | C-39는 CatalogMetadata + SQL handoff를 닫는다. | SQL MVP 이후 semantic search가 필요할 때 | post-demo RAG Phase |
