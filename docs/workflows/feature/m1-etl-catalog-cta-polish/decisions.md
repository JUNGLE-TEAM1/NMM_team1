# M1 ETL Catalog CTA polish 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. 작은 UI navigation polish이며 고영향 선택이 없다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| ETL handoff target | `Catalog detail` CTA를 `dataset_reviews_gold` detail URL로 직접 이동 | `/etl -> catalog detail` 발표 흐름을 alias/placeholder 혼동 없이 고정한다. | 사용자 지시 / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Product Health SQL success smoke | 최종 `dataset_product_health_gold` CatalogMetadata/Gold output이 아직 없어 이번 M1 UI polish에서 검증할 수 없다. | M3/M5/M6 Product Health final evidence merge 후 | 후속 M1 Product Health SQL success smoke Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| ETL handoff target | Week2 기본 demo dataset id가 바뀐다. | route constant와 browser smoke expectation을 새 dataset id에 맞춰 조정한다. |
