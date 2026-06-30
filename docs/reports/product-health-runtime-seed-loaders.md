# Product Health runtime seed loaders 보고서

## Short Report / 짧은 보고

- Type: Feature / Runtime seed loader
- Date: 2026-07-01
- Changed: Product Health 11GB 합성 데이터셋 split을 Kafka/PostgreSQL/MongoDB/MinIO에 적재하기 위한 operator CLI와 manifest sample을 추가했다. Source of Truth에는 C-47 interface/workflow/acceptance/regression/manual verification 경계를 반영했다.
- Verified: `python3 -m py_compile scripts/product_health_runtime_seed_loaders.py`, `python3 scripts/product_health_runtime_seed_loaders.py`, `python3 -m json.tool contracts/product_health_runtime_seed_manifest.sample.json`.
- Remaining: 실제 runtime write는 환경 준비 후 `--execute --manifest <manifest>`로 별도 수행한다.
- Next context: 기본 실행은 dry-run이며 `data/results/product_health_runtime_seed_load/summary.json`에 `ProductHealthRuntimeSeedLoadEvidence`를 남긴다.
- Risk: 대용량 적재는 컨테이너/디스크/버킷/DB 용량 영향을 주므로 전체 실행 전 `--limit` smoke가 필요하다.
