# AI query dataset context source 기록

- Source queue: `docs/08-development-workflow.md` Dataset Module Connection Queue
- Prior phase: `docs/workflows/feature/catalog-metadata-integration/`
- decisions.md handoff: M6는 CatalogMetadata와 Target Dataset context를 읽고 read-only SQL/evidence 결과를 만든다.

## 2026-06-30 구현 문맥

| Source | Purpose |
| --- | --- |
| `AGENTS.md` | Phase/workspace/한국어 산출물 규칙 확인 |
| `docs/00-layer-map.md` | Interface/Data integration 변경 전파 범위 확인 |
| `docs/08-development-workflow.md` C-7 | 현재 Phase branch/workspace와 완료 기준 확인 |
| `docs/03-interface-reference.md` Week 2 SQL/M6 | `SqlEngineAdapter`, `AIQueryResult`, CatalogMetadata 경계 확인 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Product Health Gold -> Catalog -> M6 SQL acceptance 확인 |
| `docs/06-regression-and-failure-scenarios.md` | DuckDB adapter guardrail, route/retrieval trace, local path leakage 회귀 기준 확인 |
| `docs/07-manual-verification-playbook.md` | Product Health E2E AI Query manual verification 흐름 확인 |
| `docs/reports/m6-m5-catalog-source-adapter.md` | 저장된 M5 catalog 우선 소비 기존 adapter 문맥 확인 |
| `docs/reports/m6-duckdb-runtime-integration.md` | DuckDB local fallback path 실행 기존 runtime 문맥 확인 |
| `contracts/product_health_catalog_metadata.sample.json` | `dataset_product_health_gold`, `gold_product_health`, allowed columns, canonical query 계약 확인 |
