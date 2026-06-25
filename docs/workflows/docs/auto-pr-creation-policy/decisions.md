# Auto PR creation policy 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Not needed. 사용자가 "PR 생성은 사람 승인 없이도 자동"이라는 정책 방향을 명시했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Auto PR creation scope | PR-ready branch may auto-push feature branch and create PR; merge/finalize/cleanup remains human-gated | 사용자가 PR 생성 자동화를 요청했고, merge는 승인 필요하다고 명시했다 | user / 2026-06-25 |
| Helper naming | Restore `--auto-pr` as preferred helper; keep `--approved-pr` compatibility alias | 자동화 정책과 helper 이름을 맞추고 기존 호출 호환성을 유지 | Codex / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Historical evidence rewrite | 과거 report/workspace는 Source of Truth가 아니라 실행 당시 evidence이므로 소급 수정하지 않음 | audit에서 historical wording이 실제 운영 혼란을 만든다고 판단될 때 | follow-up audit |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Auto PR creation | 자동 PR 생성이 원치 않는 PR을 만든 사례가 생김 | opt-out phrase 또는 PR-ready stop condition을 강화한다 |
