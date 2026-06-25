# Week2 implementation transition 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 이번 Phase는 Phase 1에서 확정한 ver2 책임 분리를 기존 구현 위에 얹는 전환 계획 문서화다. 후보 비교 없이 accepted decisions로 기록한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Existing implementation anchor | M5 workflow/catalog 유지 | 현재 main에서 M5 구현이 가장 진행되어 있고, 실행/Catalog 중심 역할이 ver2와 맞기 때문 | user request / 2026-06-25 |
| Transition style | adapter-first incremental transition | rewrite 없이 M2 runtime, M3 job logic, M6 Catalog source를 단계적으로 붙이기 위해 | user request / 2026-06-25 |
| Main E2E path timing | Phase 3에서 별도 확정 | Phase 2는 전환 원칙만 잡고, 발표 필수 경로는 독립 Phase에서 결정해야 리뷰가 쉽다. | workflow plan / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `SparkRunner` 호출 계약 | Phase 6 runner boundary decision에서 확정 | M2/M3/M5 code boundary 검토 필요 | `docs/week2-runner-boundary-decision` |
| M3 PR #105 회수 여부 | Phase 5에서 확정 | JSON main path 범위와 충돌 검토 필요 | `docs/week2-m3-json-main-path-decision` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Existing implementation anchor | M5 구현을 유지하기 어려운 blocker 발견 | Phase 4에서 anchor 재선정 |
