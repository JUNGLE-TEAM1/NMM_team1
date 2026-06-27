# PR metadata remote reconciliation 보고서

## Short Report / 짧은 보고

- Type: Hotfix
- Branch/work location: `hotfix/pr-record-reconciliation`, `docs/workflows/hotfix/pr-record-reconciliation`
- Date: 2026-06-27
- Workspace state: complete
- Context Budget mode: Lite Read
- Changed: #181/#182와 #150 이후 merged drift PR의 원격 PR title/body 보정 작업을 repo evidence로 기록했다.
- Verified: `scripts/audit-github-records.sh --pr 181 --pr 182`; `scripts/audit-github-records.sh --pr 150 --pr 153 --pr 154 --pr 156 --pr 157 --pr 159 --pr 160 --pr 167 --pr 170 --pr 180 --pr 183`; origin/main `check-pr-linked-issue.js` body check for corrected PRs
- Remaining: #181/#182 branch synchronize 후 `pr-template-drift` check rollup 확인
- Next context: #181은 Draft 유지, #182는 별도 merge/finalize 지시 전까지 open 유지
- Risk: PR metadata edit 자체는 Git commit history가 아니므로, 이 report가 보정 evidence의 기준이다.

## Remote Reconciliation / 원격 보정

| PR | Before | Applied Remote Change | After |
| --- | --- | --- | --- |
| #181 | title/body template drift | title/body를 7-section template으로 보정, `Closes #172`~`#178` 유지 | audit passed, linked issue check passed |
| #182 | approved no-issue exception missing | `No Linked Issue Exception: approved`와 사유 추가 | audit passed, linked issue check passed |

## Not Changed / 수정하지 않은 항목

- #152, #155, #162, #163, #165, #169, #179, #184, #187은 최신 기준 통과라 수정하지 않았다.

## Merged PR Metadata Reconciliation / merged PR metadata 보정

| PR | Remote Correction |
| --- | --- |
| #150 | approved no-issue exception 추가 |
| #153 | title `[검증] ...`로 보정, body 7-section template으로 재작성, approved no-issue exception 추가 |
| #154 | approved no-issue exception 추가 |
| #156 | approved no-issue exception 추가 |
| #157 | title `[기능] ...`로 보정, body 7-section template으로 재작성, approved no-issue exception 추가 |
| #159 | approved no-issue exception 추가 |
| #160 | title `[문서/운영] ...`로 보정, body 7-section template으로 재작성, approved no-issue exception 추가 |
| #167 | body 7-section template으로 재작성, existing closing keyword 유지 |
| #170 | approved no-issue exception 추가 |
| #180 | approved no-issue exception 추가 |
| #183 | title `[기능] ...`로 보정, body 7-section template으로 재작성, approved no-issue exception 추가 |
