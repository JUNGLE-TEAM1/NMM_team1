# M3 product-health Gold contract report

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `codex/m3-semantic-gold-vector-templates`, `docs/workflows/codex/m3-product-health-gold-contract`
- Date: 2026-06-28
- Workspace state: complete
- Context Budget mode: Escalate Read
- Primary context read: AGENTS.md, pasted product-health handoff request, product-health contracts/tests/tools
- Escalated context read: PR/issue templates, CI gate scripts, F drive validation summaries
- Context omitted intentionally: M1/M2/M5/M6 implementation internals beyond M3 contract consumers
- Changed: M3 product-health contracts, local reference transform, Spark/MinIO validation harness, tests, evidence report
- Verified: 8 focused tests, 14 M3 regression tests, py_compile, JSON fixture parse, diff check, F bounded smoke
- Remaining: M2/M5/M6/M1 must consume this M3 contract in their own PRs
- Next context: use issue #244 and PR #245 as the M3 product-health contract baseline
- Risk: Large PR by necessity; PR body includes approved size exception.

## 요약

이번 작업은 M3가 책임지는 `gold_product_health` 계약과 local reference transform을 고정한다. 작은 데이터로 Gold를 만들 수 있고, 같은 transform semantics가 5GB+ M2 Spark 실행으로 넘어갈 수 있도록 spec과 evidence requirement를 제공한다.

## 결과

- 고정 schema: `product_id`, `product_name`, `category_l1`, `review_count`, `average_rating`, `negative_review_rate`, `view_count`, `purchase_count`, `conversion_rate`, `delivery_count`, `late_delivery_rate`, `risk_score`.
- zero denominator: denominator가 없으면 rate는 `null`, 사용 가능한 component가 없으면 `risk_score=null`.
- risk score: 전역 상수가 아니라 source evidence 기반 policy를 추천하고 L9 승인 후 deterministic execution으로 고정한다.
- source-level aggregate 후 product_id universe를 full outer로 만들고 product master 부재만으로 fact row를 버리지 않는다.
- Gold output이 raw보다 작아져도 `full_product_universe_count`, `output_truncated`, `source_level_evidence`, `metric_non_null_counts`, `risk_score_coverage`로 축소 이유를 설명할 수 있다.

## 남은 책임 경계

M3는 production Spark 실행, catalog persistence, SQL query runtime, UI rendering을 소유하지 않는다. 이 PR은 M2/M5/M6/M1이 같은 계약을 소비할 수 있게 schema, transform intent, validation harness, catalog/query handoff fixture를 제공한다.
