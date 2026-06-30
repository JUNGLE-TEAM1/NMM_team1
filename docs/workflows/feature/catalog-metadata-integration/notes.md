# Catalog metadata integration notes

- 같은 run을 여러 번 publish해도 `source_id=run.id` 기준 기존 CatalogDataset을 반환한다.
- `source_type=target_dataset_job_run`인 catalog row만 Gold Datasets의 registered 항목으로 표시한다.
- 기존 CSV/source catalog row는 새 evidence 필드가 비어 있어도 유지된다.
