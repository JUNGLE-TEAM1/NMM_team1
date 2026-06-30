# Product Health handoff catalog ingest sources

| Source | Role |
| --- | --- |
| `/Users/jungilyou/Downloads/product-health-demo-dataset-handoff/README.md` | handoff bundle summary |
| `/Users/jungilyou/Downloads/product-health-demo-dataset-handoff/gold/gold_product_health.parquet` | handoff-native Gold input |
| `/Users/jungilyou/Downloads/product-health-demo-dataset-handoff/silver/seed_product_mapping.parquet` | identity/source mapping for canonical Gold |
| `/Users/jungilyou/Downloads/product-health-demo-dataset-handoff/catalog/dataset_product_health_gold.json` | raw handoff catalog descriptor, not direct AskLake CatalogMetadata |
| `/Users/jungilyou/Downloads/product-health-demo-dataset-handoff/catalog/product_health_source_handoff.json` | source ids and handoff metadata |
| `/Users/jungilyou/Downloads/product-health-demo-dataset-handoff/evidence/product_health_5gb_run_summary.json` | 5GB processed input evidence |
| `contracts/product_health_gold_contract.sample.json` | canonical Gold schema target |
| `contracts/product_health_catalog_metadata.sample.json` | Week 2 CatalogMetadata shape reference |
| `backend/app/services/ai_query.py` | M6 AI Query evidence and schema consumption |
| `backend/app/services/catalog_metadata.py` | CatalogMetadata helper functions |
| `backend/app/services/catalog_retriever.py` | M6 catalog retrieval rulebase |
| `backend/app/services/catalog_rag_index.py` | M6 metadata index rulebase |
| `docs/workflows/feature/product-health-handoff-catalog-ingest/decisions.md` | handoff import decision handoff |
