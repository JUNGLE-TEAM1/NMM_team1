# Transform Builder MVP 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 고영향 옵션 브리프는 작성하지 않았다. PR 3 범위는 UI/metadata-only이고 M2 실행, data migration, secret, deploy를 포함하지 않는다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Transform Builder 저장 방식 | `process_rule.steps[]`에 편집 반영 + `process_rule.builder_config`에 사용자 설정 보존 | M3 TransformSpec 기본값을 유지하면서 사용자의 column/cast/null 선택을 다음 PR의 실행 연결이 읽을 수 있게 분리한다. | user request / 2026-06-30 |
| Locked 영역 | aggregate/join은 review-only, `risk_score`/Gold schema는 locked | 데모 계약으로 동결된 의미를 사용자가 실수로 바꾸지 않게 하고 PR 3 범위를 실행 구현으로 키우지 않는다. | user request / 2026-06-30 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 자유형 transform DSL editor | PR 3 MVP 범위를 넘고 UX/실행 검증 비용이 크다. | Transform Builder 고급 편집 Phase | 후속 PR |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Transform Builder 저장 방식 | M2 runner가 다른 shape를 요구하는 경우 | `builder_config` adapter 또는 migration을 후속 PR에서 추가 |
