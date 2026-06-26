# Week2 M1 Synthetic Raw Demo Data 보고서

## Short Report / 짧은 보고

- Type: Feature / Data seed
- Date: 2026-06-26
- Changed: M1 전용 worktree `feature/week2-m1-synthetic-raw`에서 Amazon Reviews 2023 `Gift_Cards` 기반 synthetic raw 생성 스크립트와 focused `unittest`를 추가했다. local ignored `data/` 아래 `reviews_seed.jsonl` 10,000행, `product_master_seed.jsonl` 1,000행, `behavior_events_seed.jsonl` 3,000행, manifest/summary를 생성했다.
- Verified: `python3 -m unittest tests/test_week2_m1_synthetic_raw.py`; JSONL 10,000행 parse/6필드 검증; manifest/summary JSON validation; existing `contracts/workflow_definition.sample.json` + `Week2LocalRunner` smoke -> `fallback_succeeded`, input `row_count=10000`, output `output_row_count=539`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`. PR finalization 중 `origin/main` `de261e5`를 병합한 뒤 focused unittest, local runner smoke, strict harness validation을 재실행해 통과했다.
- Remaining: M3 handoff, Option 2 100,000행 확장 여부, Taxi delivery seed 후속 여부.
- Next context: M3 입력 shape는 `amazon_reviews_json` 호환, 앱/커넥터 타입은 `json`, manifest/summary에는 `data_origin=demo_synthetic_raw`와 `logical_shape=amazon_reviews_json`을 분리 기록한다.
- Risk: generated data is local and ignored by git. 다른 환경에서 필요하면 `python3 scripts/week2_m1_synthetic_raw.py --category Gift_Cards --review-rows 10000 --product-rows 1000 --events-per-product 3`로 재생성한다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/15-context-budget-rule.md`, `docs/17-parallel-milestone-protocol.md`, 사용자 제공 M1 task 문서
- Escalated context read: `docs/project-context/asklake-week2-module-plan/README.md`, `docs/project-context/asklake-week2-module-plan/decisions.md`, `docs/03-interface-reference.md`, `contracts/source_config.sample.json`, `contracts/schema_definition.sample.json`, `contracts/transform_spec.sample.json`, `contracts/workflow_definition.sample.json`, 관련 `docs/05`, `docs/06`, `docs/07` Week 2 항목
- Context omitted intentionally: 전체 report archive, M3 Bronze 구현 내부, M5 Airflow/MinIO 구현, M6 AI Query 구현, Taxi delivery seed

## M3 Handoff / M3 전달 정보

- Review seed path: `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl`
- Manifest path: `data/week2/mvp_synthesis/metadata/source_manifest.json`
- Summary path: `data/week2/mvp_synthesis/metadata/raw_demo_summary.json`
- Required fields: `review_id`, `product_id`, `rating`, `review_text`, `review_time`, `verified_purchase`
- Connector/app type: `json`
- Logical shape/profile: `amazon_reviews_json`
- Data origin: `demo_synthetic_raw`
- Known limitations: behavior events are synthetic, Taxi delivery seed is not included, this must not be presented as production shopping behavior.
