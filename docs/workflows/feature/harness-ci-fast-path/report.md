# 하네스 CI Fast Path와 Local Complete Gate 보강 보고서

## Short Report / 짧은 보고

- Type: feature / harness + CI policy
- Branch/work location: `feature/harness-ci-fast-path`, `docs/workflows/feature/harness-ci-fast-path`
- Date: 2026-06-30
- Workspace state: in-progress
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `.github/workflows/ci.yml`, `docs/12-quality-gates.md`, `docs/08-development-workflow.md`, `docs/15-context-budget-rule.md`
- Escalated context read: `docs/10-next-action-menu.md`, `docs/18-harness-regression-policy.md`, `docs/system-guardrails.md`, `docs/04-development-guide.md`, `docs/reports/_template.md`
- Context omitted intentionally: full historical reports, unrelated product/runtime implementation docs, remote GitHub ruleset state
- Changed: CI required jobs now keep stable names while path-filtering heavy harness/container/manifest checks; docs now define Fast CI, Conditional Heavy Gate, Fast Path Read, Fast Path, Local Complete Gate, and related Next Action states.
- Verified: workflow YAML parse passed, `bash -n scripts/validate-harness.sh` passed, `git diff --check` passed, `scripts/validate-harness.sh` passed, `scripts/validate-harness.sh --strict` passed, `scripts/test-harness.sh` passed 31 fixture tests.
- Remaining: remote PR CI and any branch protection change are not executed. If the team wants `ci-status` as a required aggregator, repo admin confirmation is needed.
- Next context: promote this workspace to PR-ready by running any desired final sync/PR preparation, or keep as local hold until the team accepts the CI policy change.
- Risk: path filters can miss a newly risky path. Mitigation is conservative trigger maintenance and reviewer attention on schema/security/migration/deploy changes.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/harness-ci-fast-path`, `docs/workflows/feature/harness-ci-fast-path`
- Date: 2026-06-30
- Workspace state: in-progress

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/04-development-guide.md`
- `docs/08-development-workflow.md`
- `docs/10-next-action-menu.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/18-harness-regression-policy.md`
- `docs/system-guardrails.md`

## Goal / 목표

- 일반 PR의 CI 기본 경로를 빠르게 만들고, 무거운 검사는 path/risk 기반으로 조건부 실행한다.
- 작은 저위험 변경은 local complete로 보류하고, 팀 공유가 필요할 때 PR-ready로 승격하는 운영 규칙을 추가한다.

## Changed Files / 변경 파일

- `.github/workflows/ci.yml`
- `docs/04-development-guide.md`
- `docs/08-development-workflow.md`
- `docs/10-next-action-menu.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/18-harness-regression-policy.md`
- `docs/system-guardrails.md`
- `docs/workflows/feature/harness-ci-fast-path/*`

## Implementation Summary / 구현 요약

- `harness`, `container-smoke`, `manifest-smoke` required job 이름을 유지했다.
- `harness`는 shell syntax, PR metadata fixture tests, `scripts/validate-harness.sh`를 항상 실행한다.
- `scripts/validate-harness.sh --strict`와 `scripts/test-harness.sh`는 harness/workflow/script 정책 path 변경 때만 실행한다.
- `container-smoke`와 `manifest-smoke`는 관련 runtime/manifest path가 아니면 job 내부에서 명시적으로 skip 성공한다.
- `ci-status` aggregator job을 추가했지만 required check 승격은 사람 확인이 필요한 follow-up으로 남겼다.
- 문서에는 Fast CI, Conditional Heavy Gate, Fast Path Read, Fast Path, Local Complete Gate, PR-ready promotion 메뉴를 추가했다.

## Verification Commands / 검증 명령

```bash
python3 - <<'PY'
from pathlib import Path
import yaml
data = yaml.safe_load(Path('.github/workflows/ci.yml').read_text())
assert data['name'] == 'AskLake CI'
assert 'harness' in data['jobs']
assert 'ci-status' in data['jobs']
print('workflow yaml parse passed')
PY
bash -n scripts/validate-harness.sh
git diff --check
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
scripts/test-harness.sh
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/harness-ci-fast-path/quality.md`
- Quality gate status: passed-with-skips
- TDD status: not applicable; CI workflow and policy docs change
- CI/check result: local equivalent passed; remote PR CI not run
- Skipped checks: Docker/container smoke local run, remote branch protection check
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/feature/harness-ci-fast-path/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: stable required job names with internal path filters accepted; `ci-status` required-check promotion deferred to repo admin confirmation
- Revisit/rollback condition: if a required heavy check is incorrectly skipped, add the path to the matching trigger list

## Regression Guard / 회귀 보호

- Checked feature: harness CI and workspace validation rules
- Protected behavior: harness validation, strict validation, fixture regression, required check presence, remote-setting safety boundary
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: conditional job skip leaves required check pending
- Expected behavior: existing required jobs remain always present and skip heavy steps internally
- Verification: workflow review and YAML parse
- Result: passed locally; remote PR CI still needs confirmation

## Manual Verification / 수동 검증

- Document executed: not applicable
- Environment: local macOS workspace
- Result: local harness validation and fixture regression passed
- Failure/limitation: GitHub Actions PR run not executed locally
- Evidence: command results in `quality.md`

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: not product acceptance; this is Development Operations / Quality Gates policy
- Status: not applicable
- Evidence: `docs/12-quality-gates.md`, `docs/system-guardrails.md`

## Document Updates / 문서 업데이트

- Updated: `docs/04`, `docs/08`, `docs/10`, `docs/12`, `docs/15`, `docs/18`, `docs/system-guardrails.md`
- Not updated and why: `docs/05`, `docs/06`, `docs/07` are product acceptance/regression/manual verification documents and no product behavior changed

## Failed / Incomplete / Follow-Up TODO

- Remote PR CI not run.
- Branch protection required context changes not performed.
- Consider adding a future script-level path-filter fixture if the team wants stronger local simulation of CI path filters.

## Context For Next Phase / 다음 Phase 문맥

- If this change is promoted to PR-ready, run final sync/PR preparation and inspect the first PR CI summary for heavy gate trigger/skip correctness.
- If repo admins want to simplify required checks later, evaluate making `ci-status` the single required aggregator.

## Secret / Migration / Env Check

- Secret check: no secret added
- Migration/data change: none
- Env change: GitHub Actions workflow behavior changed; no local env var required

## Final Judgment / 최종 판단

- Done: local implementation and validation complete
- Remaining risk: first remote PR CI should be reviewed to confirm GitHub Actions path filter behavior and required check presentation
