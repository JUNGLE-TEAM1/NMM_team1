# AI query dataset context 계획

## 브랜치

- Branch: `feature/ai-query-dataset-context`
- Workspace: `docs/workflows/feature/ai-query-dataset-context`
- Created: 2026-06-29

## 목표

- M6 AI Query가 fixture catalog나 추측한 output path가 아니라 저장된 Product Health `CatalogMetadata`를 읽어 read-only SQL/evidence 결과를 만든다.
- `dataset_product_health_gold` / `gold_product_health` catalog context의 `storage_uri` 또는 `storage.local_fallback_path`를 DuckDB SQL engine context로 전달한다.

## 범위

- PR 5/6 Catalog 등록 PR과 맞출 수 있도록 top-level `query_table`, `allowed_columns`, `canonical_demo_query`, `storage_uri` alias를 M6 소비 경계에서 지원한다.
- 기존 nested `query.table_name`, `query.allowed_columns`, `query.canonical_demo_query`, `storage.local_fallback_path` shape도 유지한다.
- Product Health risk/demo 질문은 Catalog가 제공한 `canonical_demo_query`를 우선 사용하고, DuckDB guardrail이 SELECT-only/table/column/LIMIT/path를 검증한다.
- 저장된 catalog store를 사용한 DuckDB integration test를 추가한다.

## 범위 제외

- LLM/RAG production quality 확장.
- write SQL.
- permission/PII masking full policy.
- dashboard full build.
- CatalogMetadata 생성/저장 자체. M6는 저장된 CatalogMetadata를 읽기 전용으로 소비한다.

## 구현 프롬프트

```text
@AGENTS.md @docs/08-development-workflow.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`feature/ai-query-dataset-context` Phase만 구현한다.
M6 AI Query가 저장된 `dataset_product_health_gold` CatalogMetadata를 기준으로 `gold_product_health` read-only SQL/evidence 결과를 만들게 한다.
AI Query는 output file path를 직접 추측하지 않고 CatalogMetadata의 `storage_uri` 또는 `storage.local_fallback_path`만 SQL engine context로 전달한다.
PR 5/6 Catalog 등록 PR과 병렬 가능하도록 `query_table`, `allowed_columns`, `canonical_demo_query` alias를 지원한다.
RAG/LLM production 확장, 권한 full policy, dashboard, CatalogMetadata 저장 구현은 제외한다.
```

## 완료 기준

- [x] AI Query가 저장된 Product Health CatalogMetadata를 선택한다.
- [x] CatalogMetadata 기반 read-only SQL context가 구성된다.
- [x] DuckDB가 CatalogMetadata의 local path 또는 local `storage_uri`만 읽는다.
- [x] `canonical_demo_query`가 있으면 Product Health risk SQL에 사용된다.
- [x] unsupported/path missing/error 상태는 기존 guardrail로 차단된다.
- [x] report와 quality evidence를 남긴다.
