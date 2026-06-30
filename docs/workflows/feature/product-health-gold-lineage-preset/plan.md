# Product Health Gold Lineage Preset 계획

## Phase

- ID: C-46
- Branch/work location: `feature/product-health-gold-lineage-preset`
- Goal: Gold preset, Run, Catalog, AI Query evidence를 외부 시스템 lineage 기준으로 정렬한다.

## Scope

- 포함: Product Health Gold가 4개 Silver를 입력으로 갖게 한다.
- 포함: preset synthesis 결과가 외부 Source/Silver lineage와 연결되게 한다.
- 포함: Run/Catalog/AI Query evidence에서 Kafka/PostgreSQL/MongoDB/S3 lineage와 prepared Gold output 경계를 함께 표시한다.
- 제외: production ETL, Airflow/Spark trigger, RAG/vector DB, arbitrary recipe builder.

## Acceptance

- `dataset_product_health` 또는 `dataset_product_health_gold`가 4개 Silver input을 명확히 표시한다.
- Gold Run은 prepared/local output을 쓰더라도 upstream lineage는 4개 외부 시스템으로 보인다.
- Catalog와 AI Query는 같은 run/catalog/path/evidence를 참조한다.

## Verification

```bash
curl -fsS -X POST http://127.0.0.1:8000/api/product-health/preset-synthesis
curl -fsS http://127.0.0.1:8000/api/catalog/datasets
npm --prefix frontend run build
```
