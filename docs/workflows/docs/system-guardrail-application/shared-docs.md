# System guardrail application 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/system-guardrails.md` | `PR linked issue required`를 `planned`에서 repo-local check 적용 상태로 갱신 | 시스템 guardrail inventory가 실제 구현 상태를 반영해야 한다. | low |
| `.github/workflows/ci.yml` | focused node test를 harness job에 추가 | PR 검사 로직 회귀를 기존 CI에서 확인한다. | low |
| `.github/workflows/pr-linked-issue-check.yml` | PR body linked issue check 추가 | PR lifecycle 누락을 시스템 check로 감지한다. | low |
| `.github/scripts/check-pr-linked-issue.js` | PR body 검사 로직 추가 | HTML 주석 예시 오탐을 막고 실제 closing keyword 또는 명시 예외만 허용한다. | low |
| `tests/pr-linked-issue-check.test.js` | focused regression test 추가 | 검사 로직의 통과/실패 조건을 고정한다. | low |

## Integration Notes / 통합 메모

- branch protection에서 required check로 지정하는 작업은 repo admin 후속 작업이다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
