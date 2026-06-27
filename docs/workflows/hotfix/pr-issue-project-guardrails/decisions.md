# PR/Issue/Project guardrail Hotfix 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 option brief는 생략했다. 사용자가 Hotfix 방향을 명확히 지정했고, 변경 범위가 PR/Issue/Project guardrail 보강으로 제한됐다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| no-issue 예외 제한 | 승인 문구가 있는 경우만 통과 | 기능/버그 PR이 issue 없이 통과하는 우회를 줄인다. | 사용자 Hotfix 요청 / 2026-06-27 |
| PR template drift gate | 기존 `audit-github-records.sh`를 PR event workflow로 실행 | template enforcement를 새 로직으로 중복 구현하지 않는다. | 사용자 Hotfix 요청 / 2026-06-27 |
| Project `Done` 기준 | merge/finalize 이후만 `Done` | 열린 PR을 Done으로 옮기면 lifecycle drift와 조기 완료 오해가 생긴다. | 사용자 확인 / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `pr-template-drift` required context 등록 | repository ruleset 변경은 repo admin 확인이 필요하다. | Hotfix PR check가 안정적으로 표시되고 팀이 hard gate 등록을 승인할 때 | follow-up admin task |
| 현재 열린 PR 원격 보정 | issue 생성/PR body 수정/Project 이동은 원격 상태 변경이므로 사람 확인이 필요하다. | 사용자가 보정 대상 PR과 액션을 승인할 때 | 별도 remote reconciliation |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| no-issue 예외 제한 | evidence-only PR까지 과도하게 막는 경우 | label 또는 actor 기반 승인 예외를 별도 Hotfix로 검토 |
| PR template drift gate | workflow noise가 과도하거나 valid PR을 잘못 막는 경우 | `scripts/audit-github-records.sh` fixture와 section 기준을 조정 |
| Project lifecycle 기준 | GitHub Project automation이 별도 lifecycle을 도입하는 경우 | `docs/11-git-sync-policy.md`와 guardrail inventory를 함께 갱신 |
