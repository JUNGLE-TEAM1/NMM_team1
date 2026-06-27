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
- `deferred`: 지금은 적용하지 않기로 보류했다.
- `planned`: 구현 후보이며 아직 동작하지 않는다.
- `requires-admin`: repository/project/platform 관리자 설정이 필요하다.
- `unknown`: 현재 상태 확인이 필요하다.

| Guardrail | Enforced By | Current Status | Failure Behavior | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `main` 직접 push 금지 | GitHub repository ruleset `AskLake main system guardrails` | enabled | direct push 또는 direct merge blocked | repo admin | default branch에 pull request rule이 active다. |
| PR required for `main` | GitHub repository ruleset `AskLake main system guardrails` | enabled | PR 없는 `main` 변경 blocked | repo admin | PR 기반 통합의 실제 강제 위치. |
| Required CI checks | GitHub repository ruleset `AskLake main system guardrails` + `.github/workflows/ci.yml` | enabled | required check 실패 시 merge blocked | repo admin / maintainer | Required contexts: `harness`, `container-smoke`, `manifest-smoke`, `linked-issue`, `migration-schema-security`. |
| Force push / branch deletion 제한 | GitHub repository ruleset `AskLake main system guardrails` | enabled | protected branch non-fast-forward push/delete blocked | repo admin | feature branch cleanup은 하네스 프로토콜과 script가 담당한다. |
| Backup branch protection | GitHub repository ruleset `AskLake backup branch guardrails` + `scripts/create-main-backup-branch.sh` | enabled | `backup/main-*` branch delete/update/non-fast-forward blocked | repo admin / maintainer | `origin/main` 백업은 protected branch로 만들고, 기존 backup branch를 덮어쓰지 않는다. |
| Secret scanning / push protection | GitHub secret scanning + push protection | enabled | secret push blocked/warned by GitHub | repo admin / maintainer | `secret_scanning`과 `secret_scanning_push_protection`이 enabled다. |
| CODEOWNERS review | `CODEOWNERS` + branch protection | deferred | 현재는 blocking review 없음 | repo admin / code owners | ownership 기준이 안정되기 전까지 보류한다. |
| Deploy/environment approval | GitHub Environment protection + `.github/workflows/deploy-dev.yml` | partial | deploy job waits or fails without approval | repo admin / release owner | workflow input approval은 있으나 Environment required reviewer 설정 확인 필요. |
| PR title/body shape | PR template + `.github/workflows/pr-template-drift-check.yml` + `scripts/audit-github-records.sh` | partial | PR 제목 prefix 또는 7-section body drift 시 check failure; merge block requires required-check setting | maintainer / repo admin | Required context 후보: `pr-template-drift`. `.github/pull_request_template.md`와 read-only audit script를 PR event에서 실행한다. |
| Issue template shape | Issue templates + audit script | partial | warning or correction request | maintainer | GitHub UI template은 안내이고 hard enforcement가 약하다. |
| PR linked issue required | `.github/workflows/pr-linked-issue-check.yml` + GitHub branch protection | enabled | PR check fails when a real closing keyword or approved no-issue exception is missing | maintainer / repo admin | `연결된 Issue: 연결된 issue 없음`만으로는 통과하지 않는다. 예외는 `No Linked Issue Exception: approved` 또는 `연결된 Issue 예외: 승인`이 함께 필요하다. |
| Branch start issue creation | `scripts/start-workflow.sh`; optional branch-push GitHub Action | partial | local workspace can start; PR readiness warns if linked issue is missing or closed | maintainer | GitHub는 local branch creation을 알 수 없으므로 시작 시점은 script-enforced protocol이다. |
| Project status sync | GitHub Project automation / GitHub Action / `scripts/prepare-pr.sh` | partial | lifecycle drift reported; optional sync job updates status | maintainer | branch start = `In Progress`, PR open = `Review`, PR merge/finalize = `Done`. |
| Lifecycle drift detection | `scripts/status-workflow.sh`, `scripts/audit-github-records.sh`, optional CI | partial | warning or PR readiness blocked | maintainer | active workspace의 linked issue가 closed인 경우를 감지한다. |
| PR size hard gate | `.github/workflows/pr-size-hard-gate.yml` + GitHub repository ruleset | enabled | non-evidence files > 10 또는 non-evidence changed lines > 600이면 required check 실패 | maintainer / repo admin | `docs/workflows/**`, `docs/reports/**` evidence 파일은 size 계산에서 제외한다. `Large PR Exception: approved`가 PR body에 있으면 명시 예외로 통과한다. |
| PR risk warning | `.github/workflows/pr-risk-warning.yml` | partial | advisory warning and step summary when risky path is detected | maintainer | 위험 경로 변경은 아직 hard gate가 아니라 reviewer 판단을 돕는 경고로 유지한다. |
| Migration/schema/security change detection | `.github/workflows/migration-schema-security-check.yml` + GitHub repository ruleset | enabled | sensitive path 변경 시 PR impact field가 비어 있으면 required check 실패 | maintainer / repo admin | `contracts/`, migration/schema/security/auth/policy 경로 변경은 PR body의 `API/schema`, `data/migration`, `security/privacy` 영향 기록을 요구한다. |
| Harness validation required check | `.github/workflows/ci.yml` + GitHub repository ruleset | enabled | merge blocked when harness validation fails | repo admin / maintainer | `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `--strict`가 `harness` required context에 포함된다. |

## 3) Team Guide

이 섹션은 팀원이 현재 적용된 시스템 룰을 빠르게 이해하기 위한 요약이다.
시스템 룰은 사람이 판단해야 할 책임을 대신하지 않고, 기계가 안정적으로 막거나 감지할 수 있는 위험만 다룬다.

### What Is Blocked

| Rule | What it means for people |
| --- | --- |
| `main` direct push blocked | `main`은 PR 없이 직접 바꾸지 않는다. 작업은 branch -> PR -> checks -> merge 흐름을 탄다. |
| PR required for `main` | `main` 반영은 PR을 통해서만 한다. 긴급 수정도 Hotfix branch와 PR 흐름을 기본으로 둔다. |
| Required checks | `harness`, `container-smoke`, `manifest-smoke`, `linked-issue`, `migration-schema-security`, `pr-size-hard-gate`가 통과해야 merge할 수 있다. `pr-template-drift`는 repo-local check가 추가됐고 required context 등록 확인이 필요하다. |
| PR size hard gate | evidence 파일을 제외한 변경 파일이 10개를 넘거나 변경 라인이 600줄을 넘으면 merge할 수 없다. 필요하면 PR body에 `Large PR Exception: approved`와 이유를 남긴다. |
| Force push / branch deletion blocked on protected refs | 보호된 branch는 히스토리를 덮어쓰거나 삭제하지 못한다. |
| Backup branch protection | `backup/main-*`은 복구 기준 branch다. 생성 후 delete/update/force push를 막는다. |
| Secret scanning / push protection | token, API key, private key 같은 secret이 push되면 GitHub가 막거나 경고한다. |
| Migration/schema/security detection | 민감 경로를 바꾸면 PR body에 영향과 검증을 써야 한다. 비어 있으면 check가 실패한다. |

### What Is Warning Only

| Rule | What it means for people |
| --- | --- |
| PR risk warning | 위험 경로 변경은 warning을 낸다. 지금은 위험 경로 자체만으로 merge를 막지 않고 reviewer 판단을 돕는다. |
| Issue template shape audit | Issue 템플릿 drift는 status/audit에서 감지할 수 있지만 모든 경우를 hard gate로 막지는 않는다. PR title/body template drift는 PR check로 막는다. |
| Lifecycle drift audit | PR/issue/project/workspace 상태 mismatch는 읽기 전용 audit으로 드러낸다. 원격 보정은 evidence를 남긴다. |

### What Is Deferred

| Deferred item | Reason |
| --- | --- |
| CODEOWNERS review | ownership 기준이 안정되기 전까지 사람 책임 경계를 시스템에 고정하지 않는다. |
| PR risk hard gate | 위험 경로 변경 자체를 hard gate로 막는 것은 아직 보류한다. |
| Remote-changing E2E rehearsal in CI | 실제 issue/PR/project/branch를 바꾸므로 normal CI에 넣지 않는다. 필요하면 human-approved rehearsal로 실행한다. |

### Common Failure And Fix

| Failure | How to fix |
| --- | --- |
| `linked-issue` failed | PR body에 `Closes #123` 같은 closing keyword를 넣는다. 실제 이슈가 없는 예외 PR은 `연결된 Issue: 연결된 issue 없음`과 `No Linked Issue Exception: approved` 또는 `연결된 Issue 예외: 승인`을 함께 남긴다. |
| `pr-template-drift` failed | PR title을 `[기능]`, `[버그]`, `[문서/운영]`, `[긴급수정]`, `[검증]` prefix로 고치고, PR body가 `.github/pull_request_template.md`의 7개 section을 포함하도록 보정한다. |
| `migration-schema-security` failed | PR body의 `API/schema 영향`, `data/migration 영향`, `security/privacy 영향` 중 해당 항목에 영향과 검증 결과를 적는다. |
| `pr-size-hard-gate` failed | PR을 더 작은 Phase/PR로 쪼개거나, 정말 필요한 경우 PR body에 `Large PR Exception: approved`와 이유를 적는다. |
| `harness` failed | workspace `quality.md`, `sync.md`, `report.md` evidence와 `scripts/validate-harness.sh --strict` 결과를 확인한다. |
| `container-smoke` failed | Docker image build, backend health test, compose smoke failure log를 확인한다. |
| `manifest-smoke` failed | `infra/k8s/base` manifest 파일과 `apiVersion`/`kind` shape를 확인한다. |
| Secret push blocked | secret 값을 제거하고 credential을 rotate한 뒤 다시 push한다. 실제 secret 값은 문서나 commit에 남기지 않는다. |
| Backup branch already exists | `scripts/create-main-backup-branch.sh`가 `-1`, `-2` suffix를 자동 선택한다. 기존 backup branch를 덮어쓰지 않는다. |

## 4) Lifecycle Guardrails

Issue, PR, Project lifecycle은 시작 단계와 통합 단계의 책임이 다르다.

| Lifecycle Step | Primary Responsibility | System Candidate | Harness Record |
| --- | --- | --- | --- |
| Branch/workspace start | `scripts/start-workflow.sh` | optional branch-push action that creates or verifies issue | `sync.md` linked issue, issue creation result, PR closing keyword |
| PR open | GitHub Action / Project automation | linked issue required check, PR template drift check, Project `Review` update | `sync.md` pushed branch and PR link |
| PR review/merge readiness | GitHub branch protection / required checks | CI, review, template, linked issue, drift checks | `quality.md`, `sync.md`, `report.md` |
| PR merge/finalize | GitHub merge + `scripts/prepare-pr.sh --finalize` | issue close, Project `Done`, branch cleanup helpers | `sync.md` merge/issue status and final evidence |
| Drift recovery | GitHub Action or manual command with evidence | lifecycle drift warning/fix workflow | `sync.md`, `notes.md`, `report.md` |

## 5) Follow-Up Candidates

- Repository admin이 `main` ruleset required check context가 실제 PR에서 기대대로 표시되는지 확인한다.
- Secret scanning custom/non-provider pattern과 validity check 확장 여부를 결정한다.
- ownership 기준이 안정되면 위험 경로용 `CODEOWNERS` 후보를 다시 검토한다.
- PR linked issue check required context가 실제 PR에서 기대대로 표시되는지 확인한다.
- Project status sync를 GitHub Project automation으로 둘지 GitHub Action으로 둘지 결정한다.
- PR size/risk warning을 hard gate로 승격할지와 override label이 필요한지 결정한다.

## 6) Scenario Audit Plan

Scenario audit은 새 hard rule을 추가하는 절차가 아니다.
목적은 현재 시스템 가드레일과 협업 하네스 기록이 실제 PR/Issue/Project/workspace 흐름에서 어긋나는 지점을 찾는 것이다.

| Test Layer | Runs By Default | Scope | Expected Result |
| --- | --- | --- | --- |
| CI unit / focused checks | yes, every PR | `tests/pr-linked-issue-check.test.js`, `tests/pr-risk-warning.test.js`, `scripts/test-harness.sh`, `scripts/validate-harness.sh --strict` | repo-local rule scripts and harness validation stay deterministic |
| PR event checks | yes, on PR events | `.github/workflows/pr-linked-issue-check.yml`, `.github/workflows/pr-size-hard-gate.yml`, `.github/workflows/pr-risk-warning.yml`, `.github/workflows/migration-schema-security-check.yml` | missing linked issue fails; oversize non-evidence PR fails unless explicitly approved; migration/schema/security impact omissions fail; risky paths emit advisory warning |
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
