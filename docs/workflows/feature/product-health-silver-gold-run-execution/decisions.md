# Product Health Silver Gold Run Execution decisions

- Decision status: accepted

## Accepted Decisions

| Decision | Rationale | Date |
| --- | --- | --- |
| Prepared Gold reuse는 `prepared_gold_reference`로 명시한다. | 이미 있는 `gold_product_health.parquet`를 사용할 때 대용량 ETL 재실행으로 오해하지 않게 한다. | 2026-06-30 |
| C-39 handoff 입력은 `catalog_publish_ready=true` Run evidence로 판단한다. | Catalog publish가 queued/blocked run 또는 output 없는 run을 소비하지 않게 한다. | 2026-06-30 |

## Deferred Decisions

| Decision | Deferred reason | Revisit trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Spark/Airflow 실제 실행 | C-38은 local/prepared execution evidence만 닫는다. | runner runtime과 DAG result artifact가 확정될 때 | 별도 runtime Phase |
