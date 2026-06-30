# Source Snapshot large data readiness notes

## 2026-06-30

- C-36은 C-26C snapshot을 대용량 데모 관점에서 더 명확히 만드는 보강 Phase다.
- 현재 Source Snapshot endpoint는 bounded sample JSONL snapshot을 생성한다.
- Product Health 5GB 증거는 `product_health_5gb_run_summary.json`의 processed input evidence와 Catalog/AI Query 경로로 설명해야 하며, Source Snapshot row/output bytes와 섞지 않는다.
