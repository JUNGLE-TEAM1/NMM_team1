# AI query dataset context 계획

## 목표

C-6에서 publish된 Gold CatalogDataset을 M6 AI Query가 CatalogMetadata 후보로 읽고, 질문 결과의 dataset/evidence/SQL context가 같은 catalog/run을 가리키게 한다.

## 범위

- SQLite CatalogDataset -> CatalogMetadata adapter
- `source_type=target_dataset_job_run`, `status=ready` catalog 후보 연결
- Week2 catalog store/fixture fallback 유지
- backend focused test

## 제외

- RAG 추가
- 자연어 goal 기반 source/recipe 추천
- SQL allowlist 세부 policy engine
- Airflow/Spark 실제 실행
