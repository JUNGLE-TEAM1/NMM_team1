# M1 Week2 API Client 연결 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

| Decision | Options Considered | Selected | Reason |
| --- | --- | --- | --- |
| API client 범위 | client only / client + live UI / full demo flow | client only | 첫 Phase를 작게 유지하고 후속 UI 연결의 기반을 만든다. |

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Week2 기본 pipeline | `pipeline_reviews_json_e2e` | M5 local runner baseline과 contract fixture가 이 id를 사용한다. | M1 live UI Phase plan |
| Week2 기본 dataset | `dataset_reviews_gold` | M5 Catalog metadata와 M6 query 대표 dataset이다. | M1 live UI Phase plan |
| 기본 executor | `local_runner` | Phase 1은 M5 runner selection을 소유하지 않고 현재 지원 executor를 소비한다. | backend `Week2WorkflowRunRequest` |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| run polling | Phase 1은 API client만 추가 | Run Status Live UI 시작 | M1 Phase 2 |
| chart rendering | Phase 1 범위 밖 | AI Query 결과 표시 이후 | M1 Phase 4/5 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| client-only Phase | UI 연결 없이 client가 과도하게 추상화됨 | Phase 2에서 실제 사용 형태에 맞춰 helper를 줄인다. |
