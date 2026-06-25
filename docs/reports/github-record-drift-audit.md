# GitHub record drift audit 보강 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-25
- Changed: `scripts/audit-github-records.sh`를 추가해 GitHub issue/PR 템플릿 drift를 읽기 전용으로 감지하고, `scripts/status-workflow.sh`가 linked issue/PR drift를 PR-ready blocker로 표시하게 했다.
- Verified: `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `scripts/audit-github-records.sh --issue 112`, `scripts/audit-github-records.sh --issue 111`
- Remaining: #112 등 기존 GitHub record 보정은 하네스 보강 이후 별도 사람 지시로 수행한다.
- Next context: PR #114의 문단형 PR 템플릿 기준과 함께 병합 순서를 관리한다.
- Risk: PR body audit 기준은 PR #114의 7-section handoff 구조를 전제로 한다.

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/github-record-drift-audit`, `docs/workflows/docs/github-record-drift-audit`
- Date: 2026-06-25
- Workspace state: complete

## Goal / 목표

- #112처럼 GitHub issue/PR이 한국어 템플릿과 PR handoff 기준을 우회하는 edge case를 PR-ready 전에 감지한다.

## Changed Files / 변경 파일

- `scripts/audit-github-records.sh`
- `scripts/status-workflow.sh`
- `scripts/test-harness.sh`
- `scripts/validate-harness.sh`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/workflows/docs/github-record-drift-audit/*`

## Verification Commands / 검증 명령

```bash
bash -n scripts/audit-github-records.sh scripts/status-workflow.sh scripts/test-harness.sh scripts/validate-harness.sh
scripts/test-harness.sh
scripts/validate-harness.sh
scripts/audit-github-records.sh --issue 112
scripts/audit-github-records.sh --issue 111
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/github-record-drift-audit/quality.md`
- Quality gate status: passed
- TDD status: applied with fixture regression cases
- CI/check result: local harness checks passed
- Skipped checks: project runtime build skipped because this is docs/harness script work

## Regression Guard / 회귀 보호

- Checked feature: GitHub record drift audit
- Protected behavior: #112형 issue는 drift로 감지하고, 정상 issue/PR fixture는 통과한다.
- Result: pass

## Manual Verification / 수동 검증

- Document executed: `scripts/audit-github-records.sh --issue 112`, `scripts/audit-github-records.sh --issue 111`
- Environment: local repo with authenticated GitHub CLI
- Result: #112 drift 감지, #111 pass
- Failure/limitation: 기존 GitHub record는 수정하지 않음

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: PR #114 병합 전에는 7-section PR body 기준과 실제 PR template이 일시적으로 분리되어 보일 수 있다.
