# Hotfix - Notion Issue Sync Last-Write-Wins

## Short Report

- Type: hotfix
- Date: 2026-06-26
- Changed: GitHub Project ↔ Notion sync에서 Notion row 부재/archived/closed 상태를 삭제 명령으로 해석하던 흐름을 제거하고, 최근 수정 시각 기반 LWW 양방향 동기화로 바꿨다.
- Verified: `node --check`, smoke test, destructive-call 정적 검사, `git diff --check`, harness validation, strict validation, workflow edge-case tests를 통과했다.
- Remaining: branch push 후 GitHub Actions `workflow_dispatch`에서 `dry_run=true`로 실제 secrets/API 환경의 계획을 확인해야 한다.
- Next context: `docs/workflows/hotfix/notion-lww-sync/`, `.github/scripts/notion-issue-sync.js`, `.github/workflows/notion-issue-sync.yml`, `tests/notion-issue-sync-hotfix-smoke.js`.
- Risk: live write smoke는 실제 Project/Notion 데이터를 변경할 수 있어 로컬에서 실행하지 않았다.

---

## Phase / Hotfix

- Type: hotfix
- Branch/work location: `hotfix/notion-lww-sync`, `docs/workflows/hotfix/notion-lww-sync`
- Date: 2026-06-26
- Workspace state: in-progress

## Reference Docs

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/04-development-guide.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/reports/README.md`

## Goal

- GitHub Project 3의 칸반 item이 Notion 기준으로 삭제되지 않게 한다.
- GitHub/Notion 중 마지막으로 실제 수정된 쪽을 기준으로 동기화한다.
- closed 이슈는 삭제가 아니라 `Done`/`closed` 상태로 보존한다.

## Changed Files

- `.github/scripts/notion-issue-sync.js`
- `.github/workflows/notion-issue-sync.yml`
- `tests/notion-issue-sync-hotfix-smoke.js`
- `docs/workflows/hotfix/notion-lww-sync/*`
- `docs/reports/hotfix-notion-lww-sync.md`

## Implementation Summary

- `Issue URL` 우선, marker page id, repo+number 순서로 Notion row를 찾도록 index를 만들었다.
- 동일 `Issue URL`의 Notion row가 여러 개면 자동 선택하지 않고 `Last Sync Source=Conflict`, `Sync Error`를 기록한다.
- `chooseSyncDirection()`을 결정 객체로 바꾸고 `githubChangedAt`, `notionChangedAt`, `reason`, `diffFields`를 남긴다.
- Project item/Notion row 부재는 삭제가 아니라 생성, 복구, re-add, 또는 conflict/warning으로 처리한다.
- 정기 동기화 경로에서 `deleteProjectV2Item`, marker 제거, missing-from-project Notion archive 기준을 제거했다.
- closed 이슈는 Project item을 유지하고 Project Status/Notion Project Status를 `Done`으로 맞춘다.
- 라벨/담당자 정렬 차이만으로 API write가 반복되지 않도록 비교를 정규화했다.
- workflow에 `dry_run` 입력과 `repository_dispatch` trigger를 추가했다.

## Skill / Tool Usage

- Used skill/plugin/tool: `github:github`, `decision-report`
- Reason: GitHub workflow/repository hotfix이며, 구현 선택과 검증 선택을 보고해야 했다.
- Impact: GitHub 관련 작업은 로컬 repo/`gh`가 아니라 현재 checkout과 GitHub Actions workflow 파일 중심으로 처리했다.
- Not used because: Notion connector는 production workspace data 조회/수정이 필요하지 않아 사용하지 않았다.

## Context Budget Evidence

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, user hotfix brief, target workflow/script
- Escalated context read: development guide, regression guard, manual verification playbook, workflow, git sync policy, quality gates, latest report index
- Context omitted intentionally: live Notion database content and GitHub Project API reads; local code hotfix에 필요하지 않고 secrets/API side effect가 있다.

## Baseline Codebase Adoption

- Current base commit: `39f62b9`
- Existing run/build/test commands: `node --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `tests/workflow-edge-cases.sh`
- Existing CI/PR/branch policy: push/PR/pull/merge/rebase는 human confirmation 뒤에 수행
- Existing docs/code mapped: `.github/scripts/notion-issue-sync.js`, `.github/workflows/notion-issue-sync.yml`, `docs/workflows/hotfix/notion-lww-sync/`
- Missing or stale docs: 없음
- Infrastructure gaps: live dry-run은 branch push와 GitHub secrets가 필요함
- Next Phase candidates: explicit Notion tombstone/delete policy 설계
- P0 before first risky implementation feature: 없음
- Deferred gaps and reason: live write smoke는 운영 데이터 영향 때문에 deferred
- Accepted risk: local smoke/static checks로 hotfix 핵심 회귀를 우선 방어
- Gaps intentionally left: Notion schema 변경 없음
- Next-change adoption plan: dry-run 결과를 보고 conflict/tombstone 정책이 필요하면 별도 workspace 생성

## Verification Commands

```bash
node --check .github/scripts/notion-issue-sync.js
node tests/notion-issue-sync-hotfix-smoke.js
rg -n "deleteProjectV2Item|removeProjectItem|removeGitHubIssueNotionMarker|shouldArchiveNotionMissingFromProject|isRecentGitHubProjectChange|GITHUB_RECENT_CHANGE_MS|archiveNotionPage\\(" .github/scripts/notion-issue-sync.js
git diff --check
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
tests/workflow-edge-cases.sh
scripts/status-workflow.sh docs/workflows/hotfix/notion-lww-sync
```

## Quality Gate Evidence

- Workspace file: `docs/workflows/hotfix/notion-lww-sync/quality.md`
- Quality gate status: passed-with-skips
- TDD status: applies; smoke test added for direction/conflict/list/closed behavior
- CI/check result: local checks passed; GitHub Actions not run locally
- Skipped checks: live GitHub/Notion write smoke, YAML parser
- CD/deploy gate: not required

## Decision Evidence

- Workspace file: `docs/workflows/hotfix/notion-lww-sync/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: LWW, absence-as-create/recover/conflict, explicit-delete-only archive, local smoke/static validation
- Revisit/rollback condition: need explicit delete semantics only after tombstone schema design

## Regression Guard

- Checked feature: GitHub Project ↔ Notion sync ownership/deletion behavior
- Protected behavior: Project item이 Notion row 부재, archived row, closed issue라는 이유만으로 삭제되지 않는다.
- Result: destructive project delete mutation과 normal marker removal path 제거 확인.

## Failure Scenario

- Reviewed failure: 양쪽이 grace window 안에서 서로 다른 값을 수정
- Expected behavior: 자동 overwrite 대신 Notion `Last Sync Source=Conflict`, `Sync Error` 기록
- Verification: smoke test에서 conflict direction 확인
- Result: passed

## Manual Verification

- Document executed: `docs/07-manual-verification-playbook.md` 기준 hotfix manual review
- Environment: local Windows checkout
- Result: workflow/script diff와 tests 확인
- Failure/limitation: live GitHub Actions dry-run은 아직 실행하지 않음
- Evidence: workspace `quality.md`

## docs/05 Acceptance Link

- Related item: hotfix user request
- Status: local implementation complete
- Evidence: smoke test and static destructive-call check

## Document Updates

- Updated: hotfix workspace, report
- Not updated and why: `docs/02`, `docs/03`, `docs/05`, `docs/06`, `docs/07`은 Notion schema/공용 계약 변경 없이 처리했기 때문에 변경하지 않았다.

## Failed / Incomplete / Follow-Up TODO

- Branch push 후 `workflow_dispatch`의 `dry_run=true`로 실제 API 환경 계획을 확인한다.
- 실제 삭제 정책이 필요하면 Notion tombstone 속성/문서를 별도 작업으로 설계한다.

## Context For Next Phase

- `Sync Error`에 conflict가 쌓이면 사람이 확인해 어느 쪽 값을 유지할지 결정해야 한다.
- 같은 입력을 두 번 실행했을 때 두 번째 mutation이 0인지 dry-run 로그로 확인한다.

## Secret / Migration / Env Check

- Secret check: secret 값은 읽거나 기록하지 않았다.
- Migration/data change: 없음
- Env change: workflow env `DRY_RUN` 추가. Notion/GitHub schema 변경 없음.

## Final Judgment

- Done: local hotfix implementation and local verification complete
- Remaining risk: live dry-run and PR/merge sync remain pending
