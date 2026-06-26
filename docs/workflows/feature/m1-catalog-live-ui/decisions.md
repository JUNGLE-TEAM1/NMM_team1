# M1 Catalog Live UI 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

| Decision | Options Considered | Selected | Reason |
| --- | --- | --- | --- |
| catalog UI 범위 | catalog only / catalog + query / full demo flow | catalog only | Phase 3를 M5 CatalogMetadata 표시로 제한하고 M6 query는 후속 Phase로 유지한다. |

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| dataset id | `dataset_reviews_gold` | M5/M6 대표 catalog contract id다. | M1 live UI Phase plan |
| API client | `getWeek2Catalog()` 재사용 | backend contract를 바꾸지 않고 Phase 1 client를 소비한다. | M1 live UI Phase plan |
| no catalog state | run 선행 안내 표시 | catalog 없음 상태를 fake success로 보이지 않게 한다. | M1 live UI Phase plan |
| detail route | `/catalog/dataset_reviews_gold` 유지 | 기존 route mapping과 발표 URL을 보존한다. | existing `App.jsx` route mapping |
| run handoff | `/etl` output에서 catalog detail CTA 추가 | run -> catalog 발표 흐름을 연결한다. | M1 live UI Phase plan |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| multi-dataset catalog browser | Phase 3 제외 범위 | 여러 dataset API가 생길 때 | later M1/M5 phase |
| catalog backend changes | M1 소유 범위 아님 | M5 contract 변경 시 | M5-owned phase |
| query 화면 연결 | M6 AI Query Live UI가 다음 단계 | Phase 4 시작 | M1 Phase 4 |
| governance/RBAC 구현 | shell placeholder 유지 | RBAC contract 확정 시 | later auth/governance phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| direct CatalogMetadata display | M5 payload shape가 변경됨 | helper mapping을 보정하고 report에 contract drift 기록 |
| run handoff CTA | demo 흐름에서 자동 이동이 더 적합해짐 | Demo Click Flow Polish에서 CTA 위치 재검토 |
| behind-main deferral | PR checks or mergeability fail due to upstream | human-approved sync 후 branch update |

