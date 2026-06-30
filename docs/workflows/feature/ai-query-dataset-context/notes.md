# AI query dataset context notes

- SQLite adapter는 `source_type=target_dataset_job_run`, `status=ready`인 CatalogDataset만 AI Query 후보로 변환한다.
- 기존 Week2 catalog store와 fixture는 fallback으로 유지한다.
- Query table name은 dataset name을 SQL identifier로 정규화해 만든다.
