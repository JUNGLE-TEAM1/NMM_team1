# Add Source of Truth Impact Gate 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full Decision Option Brief는 작성하지 않음. 새 제품 기능 선택이 아니라 하네스 검증 절차 보강이며, false positive를 줄이는 제약을 요구사항에 포함했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Source of Truth Impact Gate | `shared-docs.md` 표의 `File` 컬럼과 base commit diff를 대조하고, 미반영 시 deferred decision을 요구 | 설명 문장/과거 기록 경로로 인한 오탐을 줄이면서 실제 SOT 반영 누락을 잡기 위해 | user request / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| retroactive quality evidence for old workspaces | 기존 완료 workspace 대부분이 새 규칙 도입 전 생성되어 quality evidence 문구를 소급 강제하면 불필요한 대량 수정과 validation 실패가 생김 | 과거 workspace를 별도로 archive/audit할 때 | future docs audit |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Source of Truth Impact Gate | strict validation이 정상 SOT proposal을 오탐하거나 필요한 누락을 못 잡는 경우 | proposal parser와 deferred decision 조건을 조정한다 |
