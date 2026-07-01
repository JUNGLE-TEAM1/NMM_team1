# Product Health Gold Lake Write-through sources

| Source | Why |
| --- | --- |
| `backend/app/services/data_lake_paths.py` | canonical local lake path |
| `backend/app/services/target_dataset_local_runner.py` | Product Health Gold run execution path |
| `data/local_sources/product_health/gold/gold_product_health.parquet` | prepared reference source |
| `data/lake/gold/` | expected run output root |
