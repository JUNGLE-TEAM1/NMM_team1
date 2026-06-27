# PR record reconciliation Hotfix 보고서

## Short Report / 짧은 보고

- Type: Hotfix
- Branch/work location: `hotfix/pr-record-reconciliation`, `docs/workflows/hotfix/pr-record-reconciliation`
- Date: 2026-06-27
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, PR #181, PR #182, `docs/reports/pr-issue-project-guardrails-hotfix.md`
- Escalated context read: 없음
- Context omitted intentionally: Product/Architecture/Interface 문서는 PR metadata evidence 기록이 제품 기능 계약을 바꾸지 않으므로 생략
- Changed: #181/#182 원격 PR metadata 보정 작업을 repo evidence로 기록했다.
- Verified: `scripts/audit-github-records.sh --pr 181 --pr 182`; origin/main `check-pr-linked-issue.js` body check for #181/#182
- Remaining: #181/#182 branch synchronize 후 `pr-template-drift` check rollup 확인
- Next context: #181은 Draft 유지, #182는 별도 merge/finalize 지시 전까지 open 유지
- Risk: PR metadata edit 자체는 Git commit history가 아니므로, 이 report가 보정 evidence의 기준이다.

## Reconciliation Table / 보정 표

| PR | Before | Remote Correction Applied | After Verification |
| --- | --- | --- | --- |
| #181 | title `[codex] M3 L0-L6 contract planner`; body missing 7-section template | title `[문서/운영] M3 L0-L6 contract planner`; body rewritten to 7-section template; `Closes #172`~`#178` preserved; Draft kept | `audit-github-records` passed; linked issue check passed by closing keyword |
| #182 | body had plain `연결된 Issue: 연결된 issue 없음` without approved exception | added `No Linked Issue Exception: approved` and Korean reason | `audit-github-records` passed; linked issue check passed by approved no-issue exception |

## Historical Drift / 과거 drift

- #150, #153, #154, #156, #157, #159, #160, #167, #170, #180, #183은 merged PR이므로 원격 수정하지 않았다.
- #184는 최신 기준 통과로 판단해 수정하지 않았다.

