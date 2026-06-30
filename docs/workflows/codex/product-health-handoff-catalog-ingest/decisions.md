# Product Health handoff catalog ingest decisions

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 고영향 후보 비교는 생략했다. 이번 slice의 핵심 선택지는 raw handoff catalog 직접 등록과 canonical import 중 하나였고, 기존 Source of Truth의 `CatalogMetadata` / M6 planner 계약을 유지하려면 canonical import가 명확히 안전하다.

## Accepted Decisions / 확정된 결정

| Decision | Choice | Reason | Date |
| --- | --- | --- | --- |
| handoff exposure | canonical Gold only as default user-facing dataset | Existing M6 planner and CatalogMetadata contract expect `product_id` / `risk_score` style canonical columns. Directly exposing handoff-native Gold would break query planning. | 2026-07-01 |
| silver artifacts | internal lineage/evidence | Silver files explain how Gold was prepared but should not become default AI Query datasets in this slice. | 2026-07-01 |
| rulebase change size | add schema-shape defense, keep planner canonical | This avoids 500s for raw handoff catalog while preserving existing Product Health AI Query behavior. | 2026-07-01 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| UI에서 5GB evidence 표시 | 이번 slice는 backend import와 AI Query smoke가 목적이다. | M1 화면에서 `CatalogMetadata.metrics.input_total_bytes` 표시가 필요할 때 | M1 Product Health evidence UI follow-up |
| Silver dataset 공개 | Silver는 현재 내부 lineage/evidence로 충분하다. | 사용자가 Silver preview 또는 lineage explorer를 명시적으로 요구할 때 | Catalog lineage/Silver preview Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- |
| canonical import | frozen `schema_product_health_gold_v2`가 바뀌거나 Product Health v3 contract가 생기는 경우 | importer mapping과 tests를 새 Source of Truth에 맞춰 갱신한다. |
| raw handoff blocked path | raw handoff catalog를 직접 지원해야 하는 제품 요구가 생기는 경우 | `docs/03`부터 interface/schema 변경을 전파하고 planner/allowlist를 별도 Phase로 수정한다. |
