# Product Health runtime seed loaders 계획

## Phase

- ID: C-47
- Branch/work location: `feature/product-health-runtime-seed-loaders`, 현재 dirty worktree 때문에 `feature/data-lake-runtime-stack`에서 진행
- Goal: 11GB Product Health 합성 데이터셋을 Kafka/PostgreSQL/MongoDB/MinIO runtime source에 나눠 적재하는 operator loader를 추가한다.

## Scope

- 포함: role별 loader mapping manifest.
- 포함: `behavior_events -> Kafka`, `product_catalog -> PostgreSQL`, `reviews -> MongoDB`, `delivery_trip_logs -> MinIO/S3`.
- 포함: dry-run 기본 실행과 `ProductHealthRuntimeSeedLoadEvidence`.
- 포함: CSV/JSONL/Parquet streaming input 지원.
- 제외: 웹 UI 버튼, production scheduler, credential secret backend, 임의 source mapping UI.

## Acceptance

- `python3 scripts/product_health_runtime_seed_loaders.py` dry-run이 target별 command/evidence를 출력한다.
- `contracts/product_health_runtime_seed_manifest.sample.json`이 유효한 JSON이다.
- `--execute` 없이는 외부 runtime에 쓰지 않는다.
- evidence에 raw secret 값을 남기지 않는다.
