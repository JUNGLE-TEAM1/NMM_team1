# Branch switch and queue guard 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: no
- Reason: docs and shell read-only status script change; no product runtime logic.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: shell syntax, list-active-branches output, harness validation, strict validation, workspace status
- Refactor notes: branch queue script is separate from `status-workflow.sh` because it summarizes multiple branches, not one workspace.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `bash -n scripts/*.sh scripts/aws/*.sh` | passed | shell syntax passed |
| unit/focused test | `scripts/list-active-branches.sh` | passed | printed current branch, open PR status, active local branches, and cleanup candidates |
| integration/contract test | `scripts/validate-harness.sh --strict` | passed | validates docs and script guard |
| build/typecheck | not applicable | skipped | no product code changed |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: no
- CI result: local validation only; remote PR checks after PR creation if requested
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: no deploy touched

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| branch cleanup/delete | script only reports cleanup candidates; deletion needs explicit human approval | yes |
| remote PR/deploy actions | this branch adds read-only queue reporting only | yes |
