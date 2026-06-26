# M1 Run Status Live UI 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

| Decision | Options Considered | Selected | Reason |
| --- | --- | --- | --- |
| run UI 범위 | run only / run + catalog / full demo flow | run only | Phase 2를 `/runs` live status에 제한하고 catalog/query는 후속 Phase로 유지한다. |

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| route 유지 | 내부 `/runs`, 외부 `/etl` 매핑 유지 | 기존 shell navigation과 발표 URL을 깨지 않는다. | existing `App.jsx` route mapping |
| run 실행 client | `triggerWeek2Run()` 사용 | Phase 1 API client를 재사용하고 backend contract를 바꾸지 않는다. | M1 live UI Phase plan |
| refresh 방식 | last `run_id` 수동 refresh | polling은 Phase 2 제외 범위다. | M1 live UI Phase plan |
| failure display | error state 표시 | backend 실패를 fake success로 보이지 않게 한다. | M1 live UI Phase plan |
| placeholder 유지 | live run row를 기존 table 상단에 추가 | existing shell 구조를 보존한다. | existing Run Status UI |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| polling 또는 background refresh | Phase 2 제외 범위 | demo에서 run 완료 대기가 길어질 때 | later M1 polish |
| run 성공 후 catalog CTA | Catalog Live UI가 아직 다음 Phase | Phase 3 시작 | M1 Phase 3 |
| executor selection UI | M1이 runner selection rule을 소유하지 않음 | M5가 executor options contract를 제공할 때 | later M1/M5 integration |
| backend 포함 E2E 자동화 | 이번 환경에서 frontend 중심 검증으로 제한 | backend dev server와 fixture가 안정화될 때 | demo smoke phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| ExecutionResult direct display | M5 payload shape가 변경되어 optional field guard로도 표시가 깨짐 | view model helper를 추가하거나 Phase 3 전에 UI mapping을 보정한다. |
| placeholder 유지 | `/etl` 발표 흐름에서 run 결과와 placeholder가 충돌함 | demo polish Phase에서 table layout을 줄인다. |
| browser smoke 제한 | backend 포함 클릭 smoke가 필요해짐 | backend dev server를 켠 manual smoke를 별도 evidence로 추가한다. |
