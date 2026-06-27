# PR/Issue/Project guardrail Hotfix 보고서

## Short Report / 짧은 보고

- Type: Hotfix
- Branch/work location: `hotfix/pr-issue-project-guardrails`, `docs/workflows/hotfix/pr-issue-project-guardrails`
- Date: 2026-06-27
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/system-guardrails.md`, `docs/12-quality-gates.md`, `docs/11-git-sync-policy.md`, `.github/scripts/check-pr-linked-issue.js`, `.github/pull_request_template.md`
- Escalated context read: `docs/13-human-command-flow.md`, `docs/04-development-guide.md`, open PR read-only audit output
- Context omitted intentionally: Product/Architecture/Interface 문서는 운영 guardrail Hotfix가 제품 기능 계약을 바꾸지 않으므로 생략
- Changed: linked issue no-issue 예외를 승인 문구 필수로 제한했고, PR template drift audit workflow를 추가했으며, PR/Issue/Project lifecycle 문서를 보강했다.
- Verified: `node tests/pr-linked-issue-check.test.js`; focused Node checks; `bash -n scripts/audit-github-records.sh scripts/test-harness.sh scripts/validate-harness.sh scripts/prepare-pr.sh scripts/status-workflow.sh`; `git diff --check`; `scripts/test-harness.sh`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`
- Remaining: 기존 열린 PR 원격 보정은 실행하지 않았다. `pr-template-drift` required context 등록은 repo admin 확인이 필요하다.
- Next context: 현재 열린 PR별 보정 목록을 사람이 확인한 뒤 issue 생성/연결, PR body 수정, Project `Review` 정렬을 별도 승인한다.
- Risk: 기존 no-issue PR은 승인 문구가 없으면 새 linked issue check에서 실패한다.
- Linked issue: `#186`, Project `In Progress`; 생성 직후 unexpected `CLOSED` drift가 있어 reopen 후 `OPEN`/`In Progress`를 확인했다. PR 생성 시 `Review`로 전환 예정.

## Current Open PR Audit / 현재 열린 PR 감사

| PR | Recommended correction |
| --- | --- |
| #184 | 7-section PR body로 보정. Issue `#185` Project는 열린 PR 동안 `Review`. |
| #183 | issue 연결, title/body template 보정, size gate 해결 필요. |
| #182 | issue 연결 또는 approved no-issue 예외 사유 추가 필요. |
| #181 | title/body template 보정과 closing issue 결정 필요. |
| #180 | issue 연결 또는 approved no-issue 예외 사유 추가 필요. |
| #179 | 원격 보정 필요 없음. 열린 PR 동안 `Review`, merge/finalize 이후만 `Done`. |

## Final Judgment / 최종 판단

- Done: local Hotfix implementation and validation complete.
- Remaining risk: repository ruleset에 `pr-template-drift` required context를 등록해야 merge-block hard gate가 완성된다.
