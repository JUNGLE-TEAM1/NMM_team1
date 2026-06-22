# Harness flow consistency audit 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/10-next-action-menu.md` | Align Complete And PR Ready procedure with `PR 진행` merge/finalize meaning and stop conditions | Prevent the choice menu from implying merge needs another approval after `PR 진행` | low |
| completed workspace `next-actions.md` / `report.md` | Normalize stale PR-create-only wording in historical workspace handoff records | Team members may read workspace evidence directly | low |

## Integration Notes / 통합 메모

- No shared product contract changes.

## Conflicts To Resolve / 해결할 충돌

- None.
