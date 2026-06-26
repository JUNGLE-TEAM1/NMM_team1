# System Guardrails

이 문서는 하네스가 직접 강제하지 않고 GitHub, CI, repository settings, platform, 또는 repo-local automation이 강제하거나 감지해야 하는 안전장치를 추적한다.

하네스는 작업 상태, 판단 근거, 검증 결과, 복구 경로를 공유하는 협업 프로토콜이다.
강제 가능한 안전장치는 가능한 한 시스템에 둔다.

## 1) Responsibility Split

| Category | Responsibility |
| --- | --- |
| System Guardrails | 기계가 감지하거나 차단할 수 있고, 어기면 피해가 큰 항목을 실제로 막거나 경고한다. |
| Harness Protocol | 사람이 판단해야 하는 맥락, 작업 범위, 증거, 보류 사유, 복구 경로를 기록한다. |
| Team Agreement | 자동화가 다루기 어려운 리뷰 문화, 책임 귀속 방식, 예외 허용 기준을 합의한다. |

## 2) Guardrail Inventory

`Current Status` 값:

- `enabled`: 현재 repository 또는 workflow에서 실제로 동작한다.
- `partial`: 일부는 동작하지만 hard gate나 coverage가 부족하다.
- `planned`: 구현 후보이며 아직 동작하지 않는다.
- `requires-admin`: repository/project/platform 관리자 설정이 필요하다.
- `unknown`: 현재 상태 확인이 필요하다.

| Guardrail | Enforced By | Current Status | Failure Behavior | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `main` 직접 push 금지 | GitHub repository ruleset `AskLake main system guardrails` | enabled | direct push 또는 direct merge blocked | repo admin | default branch에 pull request rule이 active다. |
| PR required for `main` | GitHub repository ruleset `AskLake main system guardrails` | enabled | PR 없는 `main` 변경 blocked | repo admin | PR 기반 통합의 실제 강제 위치. |
| Required CI checks | GitHub repository ruleset `AskLake main system guardrails` + `.github/workflows/ci.yml` | enabled | required check 실패 시 merge blocked | repo admin / maintainer | Required contexts: `harness`, `container-smoke`, `manifest-smoke`, `linked-issue`, `migration-schema-security`. |
| Force push / branch deletion 제한 | GitHub repository ruleset `AskLake main system guardrails` | enabled | protected branch non-fast-forward push/delete blocked | repo admin | feature branch cleanup은 하네스 프로토콜과 script가 담당한다. |
| Secret scanning / push protection | GitHub secret scanning + push protection | enabled | secret push blocked/warned by GitHub | repo admin / maintainer | `secret_scanning`과 `secret_scanning_push_protection`이 enabled다. |
| CODEOWNERS review | `CODEOWNERS` + branch protection | planned | 위험 경로 변경 PR merge blocked until owner review | repo admin / code owners | schema, infra, deploy, auth/security, workflow 변경 후보. |
| Deploy/environment approval | GitHub Environment protection + `.github/workflows/deploy-dev.yml` | partial | deploy job waits or fails without approval | repo admin / release owner | workflow input approval은 있으나 Environment required reviewer 설정 확인 필요. |
| PR title/body shape | PR template + GitHub Action or audit script | partial | warning or required check failure | maintainer | `.github/pull_request_template.md`와 `scripts/audit-github-records.sh`가 있음. hard gate는 planned. |
| Issue template shape | Issue templates + audit script | partial | warning or correction request | maintainer | GitHub UI template은 안내이고 hard enforcement가 약하다. |
| PR linked issue required | `.github/workflows/pr-linked-issue-check.yml` + GitHub branch protection | partial | PR check fails when a real closing keyword or explicit no-issue exception is missing; merge block requires required-check setting | maintainer / repo admin | repo-local check는 추가됨. required check 지정은 repository setting에서 확인해야 한다. |
| Branch start issue creation | `scripts/start-workflow.sh`; optional branch-push GitHub Action | partial | local workspace can start; PR readiness warns if linked issue is missing or closed | maintainer | GitHub는 local branch creation을 알 수 없으므로 시작 시점은 script-enforced protocol이다. |
| Project status sync | GitHub Project automation / GitHub Action / `scripts/prepare-pr.sh` | partial | lifecycle drift reported; optional sync job updates status | maintainer | branch start = `In Progress`, PR open = `Review`, PR merge/finalize = `Done`. |
| Lifecycle drift detection | `scripts/status-workflow.sh`, `scripts/audit-github-records.sh`, optional CI | partial | warning or PR readiness blocked | maintainer | active workspace의 linked issue가 closed인 경우를 감지한다. |
| PR size/risk warning | `.github/workflows/pr-risk-warning.yml` | partial | advisory warning and step summary when size threshold or risky path is detected | maintainer | hard gate가 아니라 리뷰어 판단을 돕는 경고로 시작한다. |
| Migration/schema/security change detection | `.github/workflows/migration-schema-security-check.yml` + GitHub repository ruleset | enabled | sensitive path 변경 시 PR impact field가 비어 있으면 required check 실패 | maintainer / repo admin | `contracts/`, migration/schema/security/auth/policy 경로 변경은 PR body의 `API/schema`, `data/migration`, `security/privacy` 영향 기록을 요구한다. |
| Harness validation required check | `.github/workflows/ci.yml` + GitHub repository ruleset | enabled | merge blocked when harness validation fails | repo admin / maintainer | `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `--strict`가 `harness` required context에 포함된다. |

## 3) Lifecycle Guardrails

Issue, PR, Project lifecycle은 시작 단계와 통합 단계의 책임이 다르다.

| Lifecycle Step | Primary Responsibility | System Candidate | Harness Record |
| --- | --- | --- | --- |
| Branch/workspace start | `scripts/start-workflow.sh` | optional branch-push action that creates or verifies issue | `sync.md` linked issue, issue creation result, PR closing keyword |
| PR open | GitHub Action / Project automation | linked issue required check, Project `Review` update | `sync.md` pushed branch and PR link |
| PR review/merge readiness | GitHub branch protection / required checks | CI, review, template, linked issue, drift checks | `quality.md`, `sync.md`, `report.md` |
| PR merge/finalize | GitHub merge + `scripts/prepare-pr.sh --finalize` | issue close, Project `Done`, branch cleanup helpers | `sync.md` merge/issue status and final evidence |
| Drift recovery | GitHub Action or manual command with evidence | lifecycle drift warning/fix workflow | `sync.md`, `notes.md`, `report.md` |

## 4) Follow-Up Candidates

- Repository admin이 `main` ruleset required check context가 실제 PR에서 기대대로 표시되는지 확인한다.
- Secret scanning custom/non-provider pattern과 validity check 확장 여부를 결정한다.
- 위험 경로용 `CODEOWNERS` 후보를 만든다.
- PR linked issue check required context가 실제 PR에서 기대대로 표시되는지 확인한다.
- Project status sync를 GitHub Project automation으로 둘지 GitHub Action으로 둘지 결정한다.
- PR size/risk warning을 hard gate로 승격할지와 override label이 필요한지 결정한다.

## 5) Scenario Audit Plan

Scenario audit은 새 hard rule을 추가하는 절차가 아니다.
목적은 현재 시스템 가드레일과 협업 하네스 기록이 실제 PR/Issue/Project/workspace 흐름에서 어긋나는 지점을 찾는 것이다.

| Test Layer | Runs By Default | Scope | Expected Result |
| --- | --- | --- | --- |
| CI unit / focused checks | yes, every PR | `tests/pr-linked-issue-check.test.js`, `tests/pr-risk-warning.test.js`, `scripts/test-harness.sh`, `scripts/validate-harness.sh --strict` | repo-local rule scripts and harness validation stay deterministic |
| PR event checks | yes, on PR events | `.github/workflows/pr-linked-issue-check.yml`, `.github/workflows/pr-risk-warning.yml`, `.github/workflows/migration-schema-security-check.yml` | missing linked issue fails the check; migration/schema/security impact omissions fail the check; large/risky PR emits advisory warning and exits successfully |
| Read-only lifecycle audit | no, manual or scheduled | `scripts/status-workflow.sh`, `scripts/audit-github-records.sh`, GitHub issue/PR/project reads | drift is reported without changing remote state |
| Admin setting audit | no, human-approved or read-only admin audit | branch protection, required checks, secret scanning, CODEOWNERS, Environment approval | actual repository settings match the inventory status or the gap is recorded |
| External E2E rehearsal | no, human-approved only | throwaway branch/issue/PR/project lifecycle | expected remote changes, rollback, and stop conditions are stated before execution |

### Mock Scenario Matrix

| Scenario | System Layer Expectation | Harness Layer Expectation | Suggested Test Form | Blocker? |
| --- | --- | --- | --- | --- |
| PR body has no closing keyword and no explicit no-issue exception | `pr-linked-issue-check` fails | `sync.md` records missing linked issue before PR readiness | fixture unit test and PR event check | yes, when required check is enabled |
| PR body has `Closes #123` | linked issue check passes | `sync.md` keeps the same issue number and closing keyword | fixture unit test | no |
| PR exceeds file/line threshold or touches risky paths | `pr-risk-warning` writes advisory summary and exits `0` | reviewer and report decide whether to split or continue | fixture unit test and PR event warning | no by default |
| Active workspace linked issue is already closed or Project `Done` | read-only status/audit reports lifecycle drift | `sync.md`, `notes.md`, or `report.md` records recovery or deferral | manual/read-only scenario audit | blocks PR readiness until explained |
| PR is merged but linked issue or Project status is still open/stale | Project automation or audit detects mismatch | finalize evidence records actual state and next recovery step | manual/read-only scenario audit | follow-up required before cleanup |
| Workspace `quality.md` or `sync.md` is stale before PR | strict validation or status workflow flags missing evidence | current Phase updates evidence or records skip reason | local strict validation | yes |
| Phase report conflicts with Source of Truth | Source of Truth wins; validation/report review identifies conflict | update earliest impacted Source of Truth instead of patching report only | manual review plus `rg`/strict validation | yes when conflict affects current work |

### Automation Boundary

- Every PR keeps only deterministic, local, or PR-event checks in CI.
- Read-only scenario audit can be added as a manual `workflow_dispatch` or scheduled job after the team agrees on noise tolerance.
- Remote-changing E2E tests do not run in normal CI; they need human approval, rollback notes, and explicit stop conditions.
- PR size/risk remains advisory unless the team separately accepts a hard gate and override policy.
