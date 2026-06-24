# PR finalization state source 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-24
- Changed: PR merge 뒤 local `sync.md` final field가 main에 반영되지 못해 stale `open` 값으로 남는 문제를 보강했다. `scripts/status-workflow.sh`와 `scripts/list-active-branches.sh`는 PR link가 있으면 GitHub PR/issue 상태를 조회하고, GitHub가 `MERGED`/`CLOSED`이면 stale `sync.md` 값을 active/open 상태로 오해하지 않는다. `docs/04`, `docs/08`, `docs/09`, `docs/10`, `docs/11`, `docs/13`도 이 원칙에 맞췄다.
- Verified: `bash -n scripts/status-workflow.sh scripts/list-active-branches.sh scripts/test-harness.sh`, `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/status-workflow.sh docs/workflows/docs/pr-finalization-state-source`, `git diff --check`
- Remaining: PR/push는 이번 요청에 포함되지 않았다.
- Next context: branch workspace는 `docs/workflows/docs/pr-finalization-state-source`이고 linked issue는 `#65`다. PR로 올릴 때는 `scripts/prepare-pr.sh --approved-pr docs/workflows/docs/pr-finalization-state-source`를 사용한다.
- Risk: GitHub CLI가 없거나 인증되지 않은 환경에서는 remote state를 확인할 수 없어 기존 `sync.md` 값으로 fallback한다.

## Regression Guard / 회귀 보호

- Checked feature: stale `sync.md` final field interpretation
- Protected behavior: `sync.md`가 `merge status: open`, `issue close status: open`이어도 GitHub가 PR `MERGED`, issue `CLOSED`를 반환하면 상태 스크립트는 완료/cleanup 후보로 해석한다.
- Result: `scripts/test-harness.sh` fixture 2개가 추가되어 통과했다.

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/pr-finalization-state-source/quality.md`
- Quality gate status: passed
- TDD status: applies; stale finalization fixture added
- CI/check result: local equivalent passed
- Skipped checks: product runtime tests skipped because no product runtime code changed
- CD/deploy gate: not required

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` routed as harness/status verification
- Environment: local fixture tests with mocked `gh`
- Result: product UI manual verification not applicable; script status output verified by harness fixtures and `status-workflow`
- Failure/limitation: remote state detection requires authenticated GitHub CLI

## Secret / Migration / Env Check

- Secret check: no credential or secret changes
- Migration/data change: none
- Env change: none

## Final Judgment / 최종 판단

- Done: yes, local validation passed
- Remaining risk: remote CI and PR merge pending explicit human approval
