# PR issue automation 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` |  |  |  |
| `docs/03-interface-reference.md` |  |  |  |
| `docs/05-acceptance-scenarios-and-checklist.md` |  |  |  |
| `docs/06-regression-and-failure-scenarios.md` |  |  |  |
| `docs/07-manual-verification-playbook.md` |  |  |  |
| `docs/11-git-sync-policy.md` | Issue/PR automation command policy and explicit remote-action gates documented | GitHub issue/PR state tracking is Git sync policy | Low; policy-only expansion |
| `docs/13-human-command-flow.md` | PR handoff and issue close flow added in Korean-centered command style | Human command flow needs the new branch/PR behavior | Low; documentation-only |
| `docs/08-development-workflow.md` | Branch switch checkpoint rule documented | Development workflow must prevent dirty changes from following later branches | Low; policy-only expansion |
| `scripts/validate-harness.sh` | Requires recurrence-prevention rule docs and harness flow check script | Strict validation should catch missing flow-check wiring | Low; validation-only |
| `.github/pull_request_template.md` | Issue link, PR link, and issue close checklist added | PR reviewers need to verify issue close behavior | Low; checklist-only |

## Integration Notes / 통합 메모

- No integration conflict. Changes are documentation/policy aligned with explicit human confirmation gates.

## Conflicts To Resolve / 해결할 충돌

- 
