# Automatic merged branch cleanup 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | Add automatic merged branch cleanup to PR 진행/finalize scope | Keep workflow source of truth aligned with team rule | medium |
| `docs/11-git-sync-policy.md` | Define cleanup target conditions, command order, and exclusions | Prevent branch cleanup from being confused with cloud/resource cleanup | medium |
| `docs/13-human-command-flow.md` | Treat PR 진행 as cleanup-inclusive after merge/finalize | Make human command interpretation consistent | medium |
| `docs/10-next-action-menu.md` | Show cleanup in completion handoff and remaining branch queue reporting | Keep menu choices aligned with actual automation | low |

## Integration Notes / 통합 메모

- No product contract changes.

## Conflicts To Resolve / 해결할 충돌

- None.
