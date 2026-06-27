# PR metadata remote reconciliation 보고서

## Short Report / 짧은 보고

- Type: Hotfix
- Branch/work location: `hotfix/pr-record-reconciliation`, `docs/workflows/hotfix/pr-record-reconciliation`
- Date: 2026-06-27
- Workspace state: complete
- Context Budget mode: Lite Read
- Changed: #181/#182 원격 PR title/body 보정 작업을 repo evidence로 기록했다.
- Verified: `scripts/audit-github-records.sh --pr 181 --pr 182`; origin/main `check-pr-linked-issue.js` body check for #181/#182
- Remaining: #181/#182 branch synchronize 후 `pr-template-drift` check rollup 확인
- Next context: #181은 Draft 유지, #182는 별도 merge/finalize 지시 전까지 open 유지
- Risk: PR metadata edit 자체는 Git commit history가 아니므로, 이 report가 보정 evidence의 기준이다.

## Remote Reconciliation / 원격 보정

| PR | Before | Applied Remote Change | After |
| --- | --- | --- | --- |
| #181 | title/body template drift | title/body를 7-section template으로 보정, `Closes #172`~`#178` 유지 | audit passed, linked issue check passed |
| #182 | approved no-issue exception missing | `No Linked Issue Exception: approved`와 사유 추가 | audit passed, linked issue check passed |

## Not Changed / 수정하지 않은 항목

- 이미 merged된 PR은 historical drift로만 기록하고 원격 수정하지 않았다.
- #184는 최신 기준 통과라 수정하지 않았다.
