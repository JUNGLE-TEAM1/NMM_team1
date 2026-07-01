# Product Health Lake Catalog Handoff 계획

## Phase

- ID: C-50
- Branch/work location: `feature/product-health-lake-catalog-handoff`
- Current integration branch: `feature/data-lake-runtime-stack`

## 목표

C-49에서 생성한 `data/lake/gold` run output을 CatalogDataset으로 등록하고, AI Query가 같은 CatalogDataset/run/path를 읽게 한다.

## 범위

- Catalog publish가 C-49 run `output_path`를 storage local path로 사용하도록 보장한다.
- AI Query selected dataset, evidence, retrieval trace, SQL table context가 같은 catalog/run/lake path를 가리키게 한다.
- prepared/local source path가 최신 실행 결과처럼 노출되는 UI/API 표현을 정리한다.
- Product Health 대표 질문 smoke를 C-49 lake output 기준으로 검증한다.

## 제외 범위

- C-49 lake write-through 구현.
- RAG/vector DB/외부 LLM 신규 추가.
- full 5GB ETL 재실행.
- CatalogDataset 파일 삭제/cascade delete 정책 변경.

## 구현 프롬프트

```text
@AGENTS.md @docs/03-interface-reference.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md

Implement C-50 only.
Use the C-49 Product Health Gold Run output_path under data/lake/gold as the CatalogDataset storage path.
Ensure AI Query selected dataset, evidence, retrieval trace, SQL table context, and readiness display all point to the same catalog id, run id, and lake output path.
Keep prepared data/local_sources paths only as lineage/reference evidence.
Do not add RAG/vector DB/external LLM behavior or scheduler execution in this Phase.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md

Verify C-50 only.
Run backend tests and API smoke proving Catalog publish and AI Query consume the same C-49 lake output path/run id.
Run frontend build and browser smoke for /catalog and /query if the dev server is available.
Record any UI wording that still makes prepared source paths look like latest run outputs.
```

## Acceptance Criteria

- CatalogDataset `storage.local_path` equals the executed Run `output_path`.
- AI Query evidence and retrieval trace use the same CatalogDataset id and run id.
- SQL reads the lake output parquet.
- prepared path is not displayed as the latest output.

## Regression / Failure Scenario

- Catalog publishes `data/local_sources/product_health` as latest output after C-49 if failed.
- AI Query selects a stale fixture/prepared catalog when a C-49/C-50 live CatalogDataset exists if failed.
- Catalog and AI Query disagree on run id or local path if failed.
