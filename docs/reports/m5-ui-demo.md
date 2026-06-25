# M5 UI Demo 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-25
- Changed: frontend에 `Week2M5Demo` 패널을 추가했다. 버튼으로 Week 2 workflow run을 실행하고, 같은 화면에서 `ExecutionResult`, `CatalogMetadata`, storage path를 확인한다.
- Verified: `npm run build` in `frontend/` -> passed; `POST http://127.0.0.1:5176/api/week2/workflows/pipeline_reviews_json_e2e/runs` -> `ExecutionResult.row_count=10`, `bytes=2173`; backend `/api/health` -> ok; catalog API -> `CatalogMetadata.metrics.row_count=4`, `bytes=261`; in-app browser node board smoke -> passed.
- Remaining: 이 패널은 M5 이해용 local demo다. M1 정식 UI route, 실제 Airflow 연결, Parquet/MinIO output, actual Catalog DB persistence는 후속 slice다.
- Next context: backend server는 `127.0.0.1:8000`, frontend server는 `127.0.0.1:5176`에서 확인했다. 사람이 PR 전에 `Run`과 `Catalog` 버튼을 눌러 run id, input/output metrics, local path를 확인한다.
- Risk: demo는 current branch의 local Vite proxy를 사용한다. production route나 design final UI로 보지 않는다.

## Issue

- GitHub issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/112

## Manual Verification Target

```text
URL: http://127.0.0.1:5176/
Panel: Week 2 M5 Demo
Expected run status: fallback_succeeded
Expected ExecutionResult.row_count: 10
Expected CatalogMetadata.metrics.row_count: 4
Expected storage path: data/results/week2/reviews/gold/run_id=<run_id>/dataset_reviews_gold.jsonl
```

## Node Board Evidence

```text
Source: 10 rows, 9 columns including review_text, verified_purchase, marketplace, helpful_votes, debug_trace_id
Select/Filter: 10 rows, 4 columns: review_id, product_id, rating, review_time
Cast/Normalize: rating string -> number, review_time raw string -> ISO timestamp
Aggregate: 4 product rows with review_count and average_rating
Load: writes dataset_reviews_gold.jsonl
Preview: each node table exposes all demo output rows instead of a 4-row cutoff
```

## Secret / Migration / Env Check

- Secret: 새 secret 없음.
- Migration/data change: DB migration 없음. local result/metadata files만 생성된다.
- Env change: 새 환경 변수 없음.
