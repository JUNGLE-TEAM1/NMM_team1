# AI query dataset context 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: publish된 Target Dataset CatalogDataset을 AI Query CatalogSource 후보로 변환하는 adapter를 추가했다.
- Verified: backend focused tests 21 passed, frontend build 통과, HTTP smoke와 browser smoke에서 published catalog context 선택을 확인했고 smoke data/output을 정리했다.
- Remaining: RAG/goal 추천/자동 recipe 생성, SQL allowlist policy 세분화, AI Query readiness panel live catalog 보정.
- Next context: AI Query는 `selected_datasets`, `evidence`, `retrieval_trace`, SQL `FROM` table을 같은 published catalog/run 기준으로 표시해야 한다.
- Risk: C-7은 M6 query context 연결이며 대용량 처리나 Airflow/Spark 실행을 새로 검증하지 않는다.
