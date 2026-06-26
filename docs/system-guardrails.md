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
| `main` 직접 push 금지 | GitHub branch protection | requires-admin | direct push 또는 direct merge blocked | repo admin | 하네스 문서보다 repository setting에서 강제해야 한다. |
| PR required for `main` | GitHub branch protection | requires-admin | PR 없는 `main` 변경 blocked | repo admin | PR 기반 통합의 실제 강제 위치. |
| Required CI checks | GitHub branch protection + `.github/workflows/ci.yml` | partial | required check 실패 시 merge blocked | repo admin / maintainer | CI workflow는 존재하지만 required check 설정은 repository setting 확인 필요. |
| Force push / branch deletion 제한 | GitHub branch protection | requires-admin | protected branch force push/delete blocked | repo admin | feature branch cleanup은 하네스 프로토콜과 script가 담당한다. |
| Secret scanning / push protection | GitHub Advanced Security, secret scanning, optional `gitleaks` CI | planned | secret push 또는 CI blocked/warned | repo admin / maintainer | 실제 credential 값은 commit하지 않는다. |
| CODEOWNERS review | `CODEOWNERS` + branch protection | planned | 위험 경로 변경 PR merge blocked until owner review | repo admin / code owners | schema, infra, deploy, auth/security, workflow 변경 후보. |
| Deploy/environment approval | GitHub Environment protection + `.github/workflows/deploy-dev.yml` | partial | deploy job waits or fails without approval | repo admin / release owner | workflow input approval은 있으나 Environment required reviewer 설정 확인 필요. |
| PR title/body shape | PR template + GitHub Action or audit script | partial | warning or required check failure | maintainer | `.github/pull_request_template.md`와 `scripts/audit-github-records.sh`가 있음. hard gate는 planned. |
| Issue template shape | Issue templates + audit script | partial | warning or correction request | maintainer | GitHub UI template은 안내이고 hard enforcement가 약하다. |
| PR linked issue required | `.github/workflows/pr-linked-issue-check.yml` + GitHub branch protection | partial | PR check fails when a real closing keyword or explicit no-issue exception is missing; merge block requires required-check setting | maintainer / repo admin | repo-local check는 추가됨. required check 지정은 repository setting에서 확인해야 한다. |
| Branch start issue creation | `scripts/start-workflow.sh`; optional branch-push GitHub Action | partial | local workspace can start; PR readiness warns if linked issue is missing or closed | maintainer | GitHub는 local branch creation을 알 수 없으므로 시작 시점은 script-enforced protocol이다. |
| Project status sync | GitHub Project automation / GitHub Action / `scripts/prepare-pr.sh` | partial | lifecycle drift reported; optional sync job updates status | maintainer | branch start = `In Progress`, PR open = `Review`, PR merge/finalize = `Done`. |
| Lifecycle drift detection | `scripts/status-workflow.sh`, `scripts/audit-github-records.sh`, optional CI | partial | warning or PR readiness blocked | maintainer | active workspace의 linked issue가 closed인 경우를 감지한다. |
| PR size/risk warning | `.github/workflows/pr-risk-warning.yml` | partial | advisory warning and step summary when size threshold or risky path is detected | maintainer | hard gate가 아니라 리뷰어 판단을 돕는 경고로 시작한다. |
| Migration/schema/security change detection | CI path filters, CODEOWNERS, PR template, focused checks | planned | required review/check or warning | maintainer / code owners | API/schema/data/security 영향은 하네스 기록과 시스템 감지를 함께 사용한다. |
| Harness validation required check | `.github/workflows/ci.yml` + branch protection | partial | merge blocked when harness validation fails | repo admin / maintainer | `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `--strict`는 CI에 있음. |

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

- Repository admin이 `main` branch protection, required PR, required CI checks, force push/delete restrictions를 확인한다.
- Secret scanning/push protection 또는 `gitleaks` CI 도입 여부를 결정한다.
- 위험 경로용 `CODEOWNERS` 후보를 만든다.
- PR linked issue check를 branch protection required check로 지정할지 repo admin이 결정한다.
- Project status sync를 GitHub Project automation으로 둘지 GitHub Action으로 둘지 결정한다.
- PR size/risk warning을 hard gate로 승격할지와 override label이 필요한지 결정한다.
