# PR/Issue/Project guardrail Hotfix 보고서

## Short Report / 짧은 보고

- Type: Hotfix
- Branch/work location: `hotfix/pr-issue-project-guardrails`, `docs/workflows/hotfix/pr-issue-project-guardrails`
- Date: 2026-06-27
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/system-guardrails.md`, `docs/12-quality-gates.md`, `docs/11-git-sync-policy.md`, `.github/scripts/check-pr-linked-issue.js`, `.github/pull_request_template.md`
- Escalated context read: `docs/13-human-command-flow.md`, `docs/04-development-guide.md`, open PR read-only audit output
- Context omitted intentionally: Product/Architecture/Interface 문서는 이번 운영 guardrail Hotfix가 제품 기능 계약을 바꾸지 않으므로 생략
- Changed: linked issue no-issue 예외를 승인 문구 필수로 제한했고, PR template drift audit workflow를 추가했으며, PR/Issue/Project lifecycle 문서를 보강했다.
- Verified: `node tests/pr-linked-issue-check.test.js`; focused Node checks; `bash -n scripts/audit-github-records.sh scripts/test-harness.sh scripts/validate-harness.sh scripts/prepare-pr.sh scripts/status-workflow.sh`; `git diff --check`; `scripts/test-harness.sh`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`
- Remaining: 기존 열린 PR 원격 보정은 실행하지 않았고, `pr-template-drift` required context 등록은 repo admin 확인이 필요하다.
- Next context: 현재 열린 PR별 보정 목록을 사람이 확인한 뒤 issue 생성/연결, PR body 수정, Project `Review` 정렬을 별도 승인한다.
- Risk: 기존 no-issue PR은 승인 문구가 없으면 새 linked issue check에서 실패한다.
- Linked issue: `#186`, Project `In Progress`; 생성 직후 unexpected `CLOSED` drift가 있어 reopen 후 `OPEN`/`In Progress`를 확인했다. PR 생성 시 `Review`로 전환 예정.

## Current Open PR Audit / 현재 열린 PR 감사

읽기 전용 명령:

- `scripts/audit-github-records.sh --pr 179 --pr 180 --pr 181 --pr 182 --pr 183`
- `gh pr list --repo JUNGLE-TEAM1/NMM_team1 --state open --limit 20 --json ...`

| PR | Title | Author | Current signal | Recommended correction |
| --- | --- | --- | --- | --- |
| #184 | `[문서/운영] M2 코드 주석 보강` | `liamyoum` | 최신 `linked-issue` check는 success, 과거 실패 run이 rollup에 함께 남아 있음. Body는 7-section template이 아니라 간소 body다. | 새 `pr-template-drift` 기준에 맞춰 7-section PR body로 보정. Issue `#185`는 closing keyword가 있으므로 Project는 열린 PR 동안 `Review`. |
| #183 | `feat: Kafka CSV replay 콘솔 추가` | `seonho12-54` | `linked-issue` failure, `pr-size-hard-gate` failure, PR title/body template drift. | 새 issue 생성 또는 기존 issue 연결 후 `Closes #...`; PR title `[기능] ...`; 7-section body 보정; large PR split 또는 approved exception 검토; Project는 `Review`로 정렬. |
| #182 | `[문서/운영] M6 Week2 plan boundary update 보고서` | `jungilyu15` | 현재 old `linked-issue` check는 success지만 body가 `연결된 issue 없음`만 포함. | 새 룰 기준으로 issue 생성/연결 또는 `No Linked Issue Exception: approved`/`연결된 Issue 예외: 승인` 사유 추가. 열린 PR이면 Project는 `Review`, 바로 `Done` 금지. |
| #181 | `[codex] M3 L0-L6 contract planner` | `Wish-Upon-A-Star` | draft, PR title/body template drift, old linked issue check는 현재 success로 보이나 `Refs #...`만 있고 closing keyword가 아님. | title prefix 보정, 7-section body 보정, layer issue 중 실제 closing issue를 하나 정해 `Closes #...` 추가하거나 approved no-issue 예외 판단. Project는 열린 PR 동안 `Review`. |
| #180 | `[기능] Week2 delivery synthetic auxiliary seed 생성기` | `tail1887` | 현재 old `linked-issue` check는 success지만 body가 `연결된 issue 없음`만 포함. | 새 룰 기준으로 issue 생성/연결 또는 approved no-issue 예외 사유 추가. 열린 PR이면 Project는 `Review`, merge/finalize 이후만 `Done`. |
| #179 | `[기능] M2 storage adapter 추가` | `liamyoum` | linked issue `Closes #171`, template body OK, checks success. | 원격 보정 필요 없음. 열린 PR 동안 linked issue Project `Review`; merge/finalize 이후 issue close + `Done`. |

## Changed Files / 변경 파일

- `.github/scripts/check-pr-linked-issue.js`
- `.github/workflows/pr-template-drift-check.yml`
- `.github/pull_request_template.md`
- `tests/pr-linked-issue-check.test.js`
- `docs/system-guardrails.md`
- `docs/12-quality-gates.md`
- `docs/11-git-sync-policy.md`
- `docs/13-human-command-flow.md`
- `docs/04-development-guide.md`
- `docs/workflows/hotfix/pr-issue-project-guardrails/*`

## Final Judgment / 최종 판단

- Done: local Hotfix implementation and validation complete.
- Remaining risk: repository ruleset에 `pr-template-drift` required context를 등록해야 merge-block hard gate가 완성된다.
