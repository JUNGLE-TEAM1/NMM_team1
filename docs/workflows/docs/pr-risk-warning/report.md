# PR risk warning 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/pr-risk-warning`, `docs/workflows/docs/pr-risk-warning`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/system-guardrails.md`, `.github/workflows/ci.yml`, `docs/05`, `docs/06`, `docs/07`
- Escalated context read: 없음
- Context omitted intentionally: 제품 기능/architecture/interface 세부 문서는 운영 guardrail 적용 범위가 아니므로 생략
- Changed: PR risk warning script, GitHub Action workflow, focused test, CI test step, system guardrail inventory 갱신; 보완으로 merge-base diff 기준과 threshold fallback 추가
- Verified: `node tests/pr-risk-warning.test.js`, `node tests/pr-linked-issue-check.test.js`, `BASE_SHA=origin/main HEAD_SHA=HEAD node .github/scripts/check-pr-risk.js`, `scripts/validate-harness.sh --strict`, PR #138 remote checks all passed
- Remaining: hard gate/override label 후속 결정
- Next context: threshold/risky path 조정 또는 hard gate/override label 여부
- Risk: warning-only check라 merge를 직접 차단하지 않는다. hard gate는 팀 합의와 repo admin 설정이 필요하다.

---

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/pr-risk-warning`, `docs/workflows/docs/pr-risk-warning`
- Date: 2026-06-26
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/system-guardrails.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `.github/workflows/ci.yml`

## Goal / 목표

- PR 크기와 위험 경로를 시스템이 advisory warning으로 감지해 리뷰어 판단을 돕는다.

## Changed Files / 변경 파일

- `.github/scripts/check-pr-risk.js`
- `.github/workflows/pr-risk-warning.yml`
- `.github/workflows/ci.yml`
- `tests/pr-risk-warning.test.js`
- `docs/system-guardrails.md`
- `docs/workflows/docs/pr-risk-warning/*`

## Implementation Summary / 구현 요약

- merge-base 기준 `git diff --numstat`으로 changed files/additions/deletions를 계산하는 script를 추가했다.
- 기본 threshold는 `20 files`, `600 changed lines`이며, risky path 변경은 별도 warning으로 표시한다.
- threshold env 값이 숫자가 아니거나 0 이하이면 기본값으로 fallback한다.
- PR에서 실행되는 warning-only GitHub Action을 추가했다.
- 기존 CI harness job에 focused test를 추가했다.
- `docs/system-guardrails.md`에서 `PR size/risk warning` 상태를 `planned`에서 `partial`로 갱신했다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: default coding workflow, GitHub CLI
- Reason: repository 문서/CI 변경과 GitHub issue lifecycle 확인
- Impact: issue `#137`이 생성되고 Project `In Progress`로 연결됐다.
- Not used because: 별도 specialized skill이 필요한 문서/프레젠테이션/브라우저 작업이 아니었다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/system-guardrails.md`, `.github/workflows/ci.yml`, `docs/05`, `docs/06`, `docs/07`
- Escalated context read: 없음
- Context omitted intentionally: 제품 기능/architecture/interface 세부 문서는 운영 guardrail 적용 범위가 아니므로 생략

## Verification Commands / 검증 명령

```bash
node tests/pr-risk-warning.test.js
node tests/pr-linked-issue-check.test.js
BASE_SHA=origin/main HEAD_SHA=HEAD node .github/scripts/check-pr-risk.js
bash -n scripts/start-workflow.sh scripts/status-workflow.sh scripts/validate-harness.sh scripts/prepare-pr.sh scripts/harness-flow-check.sh
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
git fetch origin main
gh pr view 138 --json statusCheckRollup,mergeStateStatus
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/pr-risk-warning/quality.md`
- Quality gate status: passed
- TDD status: applied; first run failed with missing module, then focused test passed
- CI/check result: PR #138 remote checks all passed (`linked-issue`, `risk-warning`, `harness`, `container-smoke`, `manifest-smoke`)
- Skipped checks: deploy/publish는 변경 없음
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/pr-risk-warning/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: warning-only GitHub Action accepted; hard gate/override label deferred
- Revisit/rollback condition: false positive가 많거나 실제 위험 PR을 놓치면 threshold/risky path 또는 merge-base diff 기준을 재조정한다.

## Regression Guard / 회귀 보호

- Checked feature: CI/CD 우회, 프로젝트별 명령 증거 누락
- Protected behavior: PR risk warning은 merge를 막지 않고 advisory evidence만 제공한다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: PR 크기 기준이 사람 판단 영역을 강제로 막아 개발 속도를 늦추는 경우
- Expected behavior: warning-only check로 위험을 표시하고 리뷰어가 판단한다.
- Verification: `check-pr-risk.js`는 merge-base diff 기준으로 warning을 출력하지만 non-zero exit로 merge를 막지 않는다.
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`의 Phase report 기록 규칙과 PR lifecycle 수동 확인
- Environment: local macOS shell, GitHub CLI authenticated
- Result: linked issue `#137`, branch workspace, closing keyword 기록 확인
- Failure/limitation: advisory warning은 merge를 직접 차단하지 않는다. hard gate와 override label은 후속 결정이다.
- Evidence: `docs/workflows/docs/pr-risk-warning/sync.md`

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: 문서와 계약 일관성, 릴리스/제출 게이트의 check 결과 기록
- Status: satisfied for this docs/ops Phase
- Evidence: `docs/system-guardrails.md`, `quality.md`, validation commands

## Document Updates / 문서 업데이트

- Updated: `docs/system-guardrails.md`, branch workspace docs
- Not updated and why: `docs/02`, `docs/03`은 architecture/interface 변경이 아니라 생략

## Failed / Incomplete / Follow-Up TODO

- PR risk warning을 hard gate로 승격할지와 override label이 필요한지는 후속 결정이다.
- CODEOWNERS, secret scanning은 후속 Phase 후보로 남긴다.

## Context For Next Phase / 다음 Phase 문맥

- 다음 시스템 guardrail 적용 후보는 CODEOWNERS 초안 또는 secret scanning/gitleaks다.

## Secret / Migration / Env Check

- Secret check: secret/credential 변경 없음
- Migration/data change: 없음
- Env change: GitHub Action workflow 추가. runtime은 GitHub-hosted Node 사용.

## Final Judgment / 최종 판단

- Done: implementation, local validation, PR #138 merge/finalize, issue close, Project Done, remote branch cleanup complete
- Remaining risk: advisory warning은 merge를 직접 차단하지 않으며, hard gate/override label은 후속 결정이다.
