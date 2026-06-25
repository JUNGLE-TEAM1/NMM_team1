# Week2 existing implementation anchor 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Existing implementation anchor selection: preserve current M1/M4/M5/M6 runtime/demo skeletons and extend through adapter-first follow-up work.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Existing implementation anchor | Preserve M1 shell, M4 Kafka demo, M5 workflow/local runner/catalog, M6 AI Query skeleton, contracts/tests | ver2 분업을 rewrite가 아니라 기존 구현 위 전환으로 유지하기 위해 선택 | User request to proceed through Phase 6 / 2026-06-25 |
| Deletion guard | Do not replace `Week2WorkflowService`, remove `Week2LocalRunner`, or drop `Week2CatalogStore` in follow-up work without a new decision | 후속 병렬 구현이 통합 중심을 잃지 않게 보호 | User request to proceed through Phase 6 / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| M3 JSON implementation scope | M3 상세 범위는 별도 결정이 필요함 | PR #105 회수/재구현 판단 필요 | Phase 5 `docs/week2-m3-json-main-path-decision` |
| Runner boundary contract | M2/M3/M5 호출 계약은 별도 결정이 필요함 | SparkRunner와 local runner의 공통 result shape 필요 | Phase 6 `docs/week2-runner-boundary-decision` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Existing implementation anchor | 후속 구현에서 anchor 삭제 또는 전면 대체가 필요함 | 별도 decision brief와 regression evidence를 먼저 작성 |
