# Week2 main E2E path 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Main E2E path selection: Amazon Reviews JSON first, using existing M5 workflow/local runner/Catalog and M6 AI Query skeleton.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Main E2E path | Amazon Reviews JSON -> M3 profile/schema/transform spec -> M5 Workflow/Catalog -> M6 AI Query -> M1 UI | 발표 필수 경로를 하나로 닫고 Taxi/Kafka/SparkRunner를 선행 조건에서 분리하기 위해 선택 | User request to proceed through Phase 6 / 2026-06-25 |
| SparkRunner position | Supporting/follow-up runtime implementation | Phase 6 runner boundary 전에는 Spark를 발표 필수 경로로 만들지 않는다. | User request to proceed through Phase 6 / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| M3 JSON PR #105 recovery | M3 상세 범위는 별도 결정이 필요함 | PR #105의 코드 회수/재구현 범위 판단 | Phase 5 `docs/week2-m3-json-main-path-decision` |
| Runner boundary contract | M2/M3/M5 호출 계약은 별도 결정이 필요함 | SparkRunner와 TransformSpec executor가 공유할 result shape 필요 | Phase 6 `docs/week2-runner-boundary-decision` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Main E2E path | Amazon Reviews JSON으로 최소 profile/schema/transform spec 산출물을 만들 수 없음 | Phase 5에서 데이터셋 또는 최소 TransformSpec scope 재검토 |
