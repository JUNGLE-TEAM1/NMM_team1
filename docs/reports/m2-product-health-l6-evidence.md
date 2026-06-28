# M2 Product Health L6 evidence 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Changed: Product Health 작은 L6 실행 증거 CLI를 추가했다. `scripts/week2_m2_product_health_l6_evidence.py`는 source 4종 read/write evidence를 남기고, reviews input에 `gold_generation_spec` preview aggregate를 적용해 `gold_product_health.parquet`를 만든 뒤 DuckDB SQL로 읽는다. `backend/samples/product_health_l6_gold_generation_spec.json`, focused test, `contracts/runtime_config.sample.json`, `docs/03`, `docs/07`, branch workspace evidence를 추가/갱신했다.
- Verified: focused test 1 passed, CLI smoke succeeded, contract JSON validation passed, focused runner regression 14 passed, backend full tests 92 passed with escalation, backend Docker pytest 91 passed/1 skipped, compileall passed, diff check passed, harness validation passed, strict harness validation passed.
- Remaining: 5GB Product Health input evidence, Docker Spark cluster, Airflow DAG 내부 SparkRunner 호출, 최종 `negative_review_rate`/`conversion_rate`/`late_delivery_rate`/`risk_score` semantics는 후속 작업이다.
- Next context: M3가 최종 Product Health metric spec을 확정하면 이번 `transform_spec_path` smoke를 해당 spec fixture로 교체하거나 확장한다. 5GB 입력 묶음이 준비되면 같은 evidence shape로 scale run을 별도 Phase에서 실행한다.
- Risk: 이번 `gold_product_health.parquet`는 `review_count`, `average_rating`만 가진 작은 preview다. 최종 Product Health schema와 의미를 M2가 확정한 것이 아니다.
