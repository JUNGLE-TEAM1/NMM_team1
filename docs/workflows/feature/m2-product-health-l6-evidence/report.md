# M2 Product Health 실제 L6 실행 증거 생성 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-product-health-l6-evidence`, `docs/workflows/feature/m2-product-health-l6-evidence`
- Date: 2026-06-28
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, `docs/reports/m2-l6-preview-runner-adapter.md`, `docs/reports/m2-product-health-runtime-smoke.md`
- Escalated context read: `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/07-manual-verification-playbook.md`, `docs/project-context/asklake-week2-module-plan/ver2/m3-json-main-path-decision.md`
- Context omitted intentionally: Docker Spark cluster setup, Airflow DAG 내부 구현, 5GB Product Health input 생성/다운로드는 이번 작은 evidence Phase 범위가 아니다.
- Changed: Product Health 작은 L6 실행 증거 CLI를 추가했다. source 4종 read/write evidence를 남기고, reviews input에 `gold_generation_spec` preview aggregate를 적용해 `gold_product_health.parquet`를 만든 뒤 DuckDB SQL로 읽는다. `contracts/runtime_config.sample.json`, `docs/03`, `docs/07`, `docs/reports`, workspace 문서도 갱신했다.
- Verified: focused test 1 passed, CLI smoke succeeded, contract JSON validation passed, focused runner regression 14 passed, full backend tests 92 passed with escalation, backend Docker pytest 91 passed/1 skipped, compileall passed, diff check passed, harness validation passed, strict harness validation passed.
- Remaining: 5GB Product Health input evidence, Docker Spark cluster, Airflow DAG 내부 SparkRunner 호출, 최종 `negative_review_rate`/`conversion_rate`/`late_delivery_rate`/`risk_score` semantics는 후속이다.
- Next context: 다음 M2 후보는 같은 script/runner 경로에 5GB Product Health input 묶음을 연결하거나, M3가 확정한 최종 metric spec을 받아 `negative_review_rate`, `conversion_rate`, `late_delivery_rate`, `risk_score`를 포함한 Gold output으로 확장하는 것이다.
- Risk: 이번 output은 `review_count`, `average_rating`만 가진 작은 Gold preview다. 최종 Product Health schema와 의미를 M2가 확정한 것이 아니다.
