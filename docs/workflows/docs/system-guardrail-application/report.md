# System guardrail application 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/system-guardrail-application`, `docs/workflows/docs/system-guardrail-application`
- Date: 2026-06-26
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/system-guardrails.md`, `.github/pull_request_template.md`, `.github/workflows/ci.yml`, `docs/05`, `docs/06`, `docs/07`
- Escalated context read: 없음
- Context omitted intentionally: 제품 기능/architecture/interface 문서는 이번 운영 guardrail 적용 범위가 아니므로 생략
- Changed: PR linked issue 검사 script, GitHub Action workflow, focused test, CI test step, system guardrail inventory 갱신
- Verified: `node tests/pr-linked-issue-check.test.js`, `bash -n ...`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git fetch origin main`, PR #136 remote checks all passed
- Remaining: 사람 확인 후 PR #136 merge 여부 결정, merge 후 finalize/cleanup 여부 확인, repo admin required-check 설정 여부 결정
- Next context: repository admin이 새 check를 required check로 지정할지 여부
- Risk: GitHub Action은 추가됐지만 branch protection required check 설정은 repo admin 권한이 필요하다.

---

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/system-guardrail-application`, `docs/workflows/docs/system-guardrail-application`
- Date: 2026-06-26
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/system-guardrails.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `.github/pull_request_template.md`
- `.github/workflows/ci.yml`

## Goal / 목표

- PR linked issue guardrail을 하네스 규칙이 아니라 GitHub Action 기반 시스템 check로 1차 적용한다.

## Changed Files / 변경 파일

- `.github/scripts/check-pr-linked-issue.js`
- `.github/workflows/pr-linked-issue-check.yml`
- `.github/workflows/ci.yml`
- `tests/pr-linked-issue-check.test.js`
- `docs/system-guardrails.md`
- `docs/workflows/docs/system-guardrail-application/*`

## Implementation Summary / 구현 요약

- PR body에서 HTML 주석을 제거한 뒤 실제 closing keyword 또는 명시적 `연결된 issue 없음` 예외를 확인하는 Node script를 추가했다.
- PR open/edit/sync/reopen/ready_for_review 시 실행되는 GitHub Action check를 추가했다.
- 기존 CI harness job에 focused test를 추가해 검사 로직 회귀를 막았다.
- `docs/system-guardrails.md`에서 `PR linked issue required` 상태를 `planned`에서 `partial`로 갱신했다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: default coding workflow, GitHub CLI
- Reason: repository 문서/CI 변경과 issue lifecycle 확인
- Impact: GitHub issue `#135` drift를 확인했고, PR 생성 시 `prepare-pr.sh`가 issue를 reopen한 뒤 Project status를 `Review`로 맞췄다.
- Not used because: 별도 specialized skill이 필요한 문서/프레젠테이션/브라우저 작업이 아니었다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/system-guardrails.md`, `.github/pull_request_template.md`, `.github/workflows/ci.yml`, `docs/05`, `docs/06`, `docs/07`
- Escalated context read: issue lifecycle drift 확인을 위해 `scripts/prepare-pr.sh`, `scripts/status-workflow.sh` 관련 섹션을 `rg`로 확인
- Context omitted intentionally: 제품 기능/architecture/interface 세부 문서는 운영 guardrail 적용 범위가 아니므로 생략

## Verification Commands / 검증 명령

```bash
node tests/pr-linked-issue-check.test.js
bash -n scripts/start-workflow.sh scripts/status-workflow.sh scripts/validate-harness.sh scripts/prepare-pr.sh scripts/harness-flow-check.sh
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
git fetch origin main
scripts/status-workflow.sh docs/workflows/docs/system-guardrail-application
gh pr view 136 --json statusCheckRollup,mergeStateStatus
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/system-guardrail-application/quality.md`
- Quality gate status: passed
- TDD status: applied; first run failed with missing module, then focused test passed
- CI/check result: PR #136 remote checks all passed (`linked-issue`, `harness`, `container-smoke`, `manifest-smoke`)
- Skipped checks: deploy/publish는 변경 없음
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/system-guardrail-application/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: repo-local PR check 적용은 accepted; required check 지정은 repo admin 후속 결정
- Revisit/rollback condition: PR check가 예외 PR을 과도하게 막으면 explicit no-issue 문구 또는 label 기반 override를 재검토한다.

## Regression Guard / 회귀 보호

- Checked feature: CI/CD 우회, 프로젝트별 명령 증거 누락
- Protected behavior: PR readiness와 lifecycle 증거가 `quality.md`, `sync.md`, `report.md`에 남는다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: PR template의 HTML 주석 예시 `Closes #123`가 실제 linked issue로 오인되는 경우
- Expected behavior: HTML 주석 제거 후 실제 closing keyword 또는 명시 예외가 없으면 실패한다.
- Verification: `tests/pr-linked-issue-check.test.js`
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`의 Phase report 기록 규칙과 PR lifecycle 수동 확인
- Environment: local macOS shell, GitHub CLI authenticated
- Result: linked issue `#135`, branch workspace, closing keyword 기록 확인
- Failure/limitation: `#135`는 PR 생성 전 Project `Done` 상태 변경과 함께 자동 close되는 drift가 있었으나, PR 생성 시 reopen/Review 상태로 복구됐다. required-check 지정은 repo admin 후속 작업이다.
- Evidence: `scripts/status-workflow.sh docs/workflows/docs/system-guardrail-application`

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: 문서와 계약 일관성, 릴리스/제출 게이트의 check 결과 기록
- Status: satisfied for this docs/ops Phase
- Evidence: `docs/system-guardrails.md`, `quality.md`, validation commands

## Document Updates / 문서 업데이트

- Updated: `docs/system-guardrails.md`, branch workspace docs
- Not updated and why: `docs/02`, `docs/03`은 architecture/interface 변경이 아니라 생략

## Failed / Incomplete / Follow-Up TODO

- 새 PR check를 branch protection required check로 지정하는 것은 repo admin 후속 작업이다.
- CODEOWNERS, secret scanning, PR size/risk warning은 후속 Phase 후보로 남긴다.

## Context For Next Phase / 다음 Phase 문맥

- 다음 시스템 guardrail 적용 후보는 CODEOWNERS 초안, secret scanning/gitleaks, PR size/risk warning 중 하나다.

## Secret / Migration / Env Check

- Secret check: secret/credential 변경 없음
- Migration/data change: 없음
- Env change: GitHub Action workflow 추가. runtime은 GitHub-hosted Node 사용.

## Final Judgment / 최종 판단

- Done: implementation, local validation, PR #136 creation, and remote CI/check verification complete
- Remaining risk: required-check 설정은 repo admin 권한이 필요하며, merge/finalize/cleanup은 사람 확인 후 진행해야 한다.
