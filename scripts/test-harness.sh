#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_root="$(mktemp -d "${TMPDIR:-/tmp}/asklake-harness-test.XXXXXX")"
test_count=0

cleanup() {
  rm -rf "$tmp_root"
}
trap cleanup EXIT

log() {
  printf '==> %s\n' "$*"
}

pass() {
  printf 'PASS: %s\n' "$*"
}

fail() {
  printf 'FAIL: %s\n' "$*" >&2
  exit 1
}

copy_repo() {
  local dest="$1"
  mkdir -p "$dest"
  (
    cd "$repo_root"
    tar \
      --exclude='.git' \
      --exclude='frontend/node_modules' \
      --exclude='.pytest_cache' \
      --exclude='__pycache__' \
      -cf - .
  ) | (
    cd "$dest"
    tar -xf -
  )
  (
    cd "$dest"
    while IFS= read -r report; do
      awk '
        /^- Workspace state:/ { print "- Workspace state: archived"; next }
        { print }
      ' "$report" > "${report}.tmp"
      mv "${report}.tmp" "$report"
    done < <(find docs/workflows -mindepth 3 -maxdepth 3 -name report.md -print)
    git init -q
    git config user.email "harness-test@example.local"
    git config user.name "Harness Test"
    git add -A
    git commit -q -m "fixture base"
  )
}

base_commit() {
  git rev-parse --short HEAD
}

write_common_workspace() {
  local workspace="$1"
  local state="$2"
  local quality_status="$3"
  local decision_status="$4"
  local base="$5"

  mkdir -p "$workspace"

  cat > "${workspace}/plan.md" <<'EOF_PLAN'
# Harness fixture plan

## 목표

- fixture validation

## 범위

- fixture only

## 범위 제외

- remote changes

## 구현 프롬프트

```text
fixture
```

## 검증 프롬프트

```text
fixture
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] fixture complete
EOF_PLAN

  cat > "${workspace}/notes.md" <<'EOF_NOTES'
# Harness fixture notes

## 진행 메모

- fixture
EOF_NOTES

  cat > "${workspace}/report.md" <<EOF_REPORT
# Harness fixture report

## Short Report / 짧은 보고

- Type: test
- Branch/work location: \`test/harness-fixture\`, \`${workspace}\`
- Date: 2026-06-22
- Workspace state: ${state}
- Context Budget mode: Lite Read
- Primary context read: fixture
- Escalated context read: none
- Context omitted intentionally: none
- Changed: fixture
- Verified: fixture
- Remaining: none
- Next context: none
- Risk: none
EOF_REPORT

  cat > "${workspace}/quality.md" <<EOF_QUALITY
# Harness fixture quality

- Quality gate status: ${quality_status}

## TDD Plan / TDD 계획

- Applies: no
- Reason: fixture
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: fixture
- Refactor notes: none

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| fixture | \`scripts/validate-harness.sh --strict\` | pass | fixture |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: fixture
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: fixture

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| product runtime tests | fixture only | yes |
EOF_QUALITY

  cat > "${workspace}/decisions.md" <<EOF_DECISIONS
# Harness fixture decisions

- Decision status: ${decision_status}

## Decision Option Briefs / 결정 옵션 브리프

- not needed

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| fixture | accepted | fixture | test |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| fixture | fixture | fixture |
EOF_DECISIONS

  cat > "${workspace}/shared-docs.md" <<'EOF_SHARED'
# Harness fixture shared docs

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |

## Integration Notes / 통합 메모

- none

## Conflicts To Resolve / 해결할 충돌

- none
EOF_SHARED

  cat > "${workspace}/sources.md" <<'EOF_SOURCES'
# Harness fixture sources

## Source Branch Workspaces / source branch workspace

- none

## Required Source Files / 읽어야 할 source 파일

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |

## Integration Notes / 통합 메모

- none
EOF_SOURCES

  cat > "${workspace}/confirmations.md" <<'EOF_CONFIRM'
# Harness fixture confirmations

## Scope Confirm / 범위 확인

- Status: accepted
- Human response: fixture

## Contract Confirm / 계약 확인

- Status: accepted
- Human response: fixture

## Scope Change Confirm / 범위 변경 확인

- Status: not needed
- Human response: fixture

## Verification Confirm / 검증 확인

- Status: accepted
- Human response: fixture

## Quality Gate Confirm / 품질 게이트 확인

- Status: accepted
- Human response: fixture

## Git Sync Confirm / Git sync 확인

- Status: accepted
- Human response: fixture

## Sync Conflict Confirm / sync 충돌 확인

- Status: not needed
- Human response: fixture

## Completion Confirm / 완료 확인

- Status: accepted
- Human response: fixture

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Human response: fixture
EOF_CONFIRM

  cat > "${workspace}/next-actions.md" <<'EOF_NEXT'
# Harness fixture next actions

## Recommended Next Action

- fixture complete
EOF_NEXT

  cat > "${workspace}/sync.md" <<EOF_SYNC
# Harness fixture sync

## Start Sync / 시작 sync

- main branch: main
- current branch: test/harness-fixture
- base commit: ${base}
- pulled at:
- command:
- result: fixture from ${base}

## Mid-Phase Sync Checks / 진행 중 sync 확인

| Checked At | Upstream Changes | Impacted Source of Truth | Action |
| --- | --- | --- | --- |

## Pre-Merge Sync

- main commit: ${base}
- conflicts: none
- validation: fixture
- result: ready for PR preparation
- deferral reason:

## Push / PR

- linked GitHub issue: #1
- issue link: https://example.invalid/issues/1
- issue creation result: fixture
- PR closing keyword: Closes #1
- pushed branch:
- PR link:
- merge status:
- issue close status:
EOF_SYNC
}

append_sot_proposal() {
  local workspace="$1"
  local file="$2"
  awk -v file="$file" '
    /^\| --- \| --- \| --- \| --- \|/ {
      print
      print "| `" file "` | fixture change | fixture reason | low |"
      next
    }
    { print }
  ' "${workspace}/shared-docs.md" > "${workspace}/shared-docs.md.tmp"
  mv "${workspace}/shared-docs.md.tmp" "${workspace}/shared-docs.md"
}

append_deferred_decision() {
  local workspace="$1"
  awk '
    /^## Deferred Decisions/ { in_deferred=1 }
    /^## / && in_deferred && $0 !~ /^## Deferred Decisions/ { in_deferred=0 }
    in_deferred && /^\| --- \| --- \| --- \|/ && !done {
      print
      print "| fixture defer | next branch owns this fixture | future fixture run | test/harness-follow-up |"
      done=1
      next
    }
    { print }
  ' "${workspace}/decisions.md" > "${workspace}/decisions.md.tmp"
  mv "${workspace}/decisions.md.tmp" "${workspace}/decisions.md"
}

run_expect_success() {
  local name="$1"
  shift
  test_count=$((test_count + 1))
  log "$name"
  if "$@"; then
    pass "$name"
  else
    fail "$name"
  fi
}

run_expect_failure() {
  local name="$1"
  shift
  test_count=$((test_count + 1))
  log "$name"
  if "$@"; then
    fail "${name}: command unexpectedly succeeded"
  else
    pass "$name"
  fi
}

case_valid_workspace_passes() {
  local repo="${tmp_root}/valid"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-valid"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    append_sot_proposal "$workspace" "docs/harness-fixture-valid.md"
    echo "# Harness fixture valid" > docs/harness-fixture-valid.md
    git add docs/harness-fixture-valid.md "$workspace"
    git commit -q -m "valid harness fixture"
    scripts/validate-harness.sh --strict >/tmp/harness-valid.out 2>/tmp/harness-valid.err
  )
}

case_unresolved_sot_fails() {
  local repo="${tmp_root}/unresolved"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-unresolved"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    append_sot_proposal "$workspace" "docs/harness-fixture-unresolved.md"
    git add "$workspace"
    git commit -q -m "unresolved harness fixture"
    scripts/validate-harness.sh --strict >/tmp/harness-unresolved.out 2>/tmp/harness-unresolved.err
  )
}

case_deferred_sot_passes() {
  local repo="${tmp_root}/deferred"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-deferred"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    append_sot_proposal "$workspace" "docs/harness-fixture-deferred.md"
    append_deferred_decision "$workspace"
    git add "$workspace"
    git commit -q -m "deferred harness fixture"
    scripts/validate-harness.sh --strict >/tmp/harness-deferred.out 2>/tmp/harness-deferred.err
  )
}

case_pr_link_without_branch_fails() {
  local repo="${tmp_root}/pr-link"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-pr-link"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    awk '
      /^- PR link:/ { print "- PR link: https://example.invalid/pull/1"; next }
      /^- merge status:/ { print "- merge status: open"; next }
      /^- issue close status:/ { print "- issue close status: open"; next }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    git add "$workspace"
    git commit -q -m "broken pr sync fixture"
    scripts/validate-harness.sh --strict >/tmp/harness-pr-link.out 2>/tmp/harness-pr-link.err
  )
}

case_missing_premerge_fails() {
  local repo="${tmp_root}/missing-premerge"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-missing-premerge"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    awk '
      /^- result:/ && in_pre { print "- result:"; next }
      /^- deferral reason:/ && in_pre { print "- deferral reason:"; next }
      /^## Pre-Merge Sync/ { in_pre=1 }
      /^## Push \/ PR/ { in_pre=0 }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    git add "$workspace"
    git commit -q -m "missing premerge fixture"
    scripts/validate-harness.sh --strict >/tmp/harness-missing-premerge.out 2>/tmp/harness-missing-premerge.err
  )
}

case_status_reports_sot() {
  local repo="${tmp_root}/status"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-status"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    append_sot_proposal "$workspace" "docs/harness-fixture-status.md"
    echo "# Harness fixture status" > docs/harness-fixture-status.md
    git add docs/harness-fixture-status.md "$workspace"
    git commit -q -m "status harness fixture"
    scripts/status-workflow.sh "$workspace" > /tmp/harness-status.out
    rg -q "proposal status: applied" /tmp/harness-status.out
  )
}

case_existing_pr_status_does_not_recommend_auto_pr() {
  local repo="${tmp_root}/existing-pr-status"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-existing-pr"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    awk '
      /^- pushed branch:/ { print "- pushed branch: test/harness-existing-pr"; next }
      /^- PR link:/ { print "- PR link: https://example.invalid/pull/2"; next }
      /^- merge status:/ { print "- merge status: open"; next }
      /^- issue close status:/ { print "- issue close status: open"; next }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    git add "$workspace"
    git commit -q -m "existing pr status fixture"
    scripts/status-workflow.sh "$workspace" > /tmp/harness-existing-pr-status.out
    rg -q "PR이 이미 열려 있습니다" /tmp/harness-existing-pr-status.out
    ! rg -q "자동 PR 생성 대상입니다" /tmp/harness-existing-pr-status.out
  )
}

case_complete_pr_ready_status_requires_pre_pr_checkpoint() {
  local repo="${tmp_root}/pre-pr-checkpoint-status"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-pre-pr-checkpoint"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    git add "$workspace"
    git commit -q -m "pre pr checkpoint status fixture"
    scripts/status-workflow.sh "$workspace" > /tmp/harness-pre-pr-checkpoint-status.out
    rg -q "Pre-PR Human Checkpoint" /tmp/harness-pre-pr-checkpoint-status.out
    rg -q "로컬 완료로 보류" /tmp/harness-pre-pr-checkpoint-status.out
    ! rg -q "자동 PR 생성 대상입니다" /tmp/harness-pre-pr-checkpoint-status.out
  )
}

case_prepare_pr_check_is_local() {
  local repo="${tmp_root}/prepare-pr"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-prepare-pr"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    git add "$workspace"
    git commit -q -m "prepare pr fixture"
    scripts/prepare-pr.sh --check-pr-sync "$workspace" >/tmp/harness-prepare-pr.out
    ! rg -q "Created PR|To https://|github.com/.*/pull/" /tmp/harness-prepare-pr.out
  )
}

case_prepare_pr_documents_approved_pr() {
  local repo="${tmp_root}/prepare-pr-approved"
  copy_repo "$repo"
  (
    cd "$repo"
    scripts/prepare-pr.sh --help > /tmp/harness-prepare-pr-help.out
    rg -q -- "--approved-pr" /tmp/harness-prepare-pr-help.out
    rg -q "deprecated compatibility alias" /tmp/harness-prepare-pr-help.out
    rg -q -- "--approved-pr" docs/11-git-sync-policy.md
  )
}

case_docs_branch_remote_tracking_is_reported() {
  local repo="${tmp_root}/docs-branch"
  local remote="${tmp_root}/docs-branch-origin.git"
  copy_repo "$repo"
  git init -q --bare "$remote"
  (
    cd "$repo"
    git remote add origin "$remote"
    git branch -M main
    git push -q -u origin main
    git checkout -q -b docs/harness-branch
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/docs/harness-branch"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    git add "$workspace"
    git commit -q -m "docs branch fixture"
    git push -q -u origin docs/harness-branch
    scripts/list-active-branches.sh > /tmp/harness-docs-branch.out
    rg -q "Remote Workspace Branches" /tmp/harness-docs-branch.out
    rg -q '\| `docs/harness-branch` \|.*\| yes \| yes \| `docs/workflows/docs/harness-branch`' /tmp/harness-docs-branch.out
  )
}

case_missing_harness_test_script_fails() {
  local repo="${tmp_root}/missing-harness-test"
  copy_repo "$repo"
  (
    cd "$repo"
    rm -f scripts/test-harness.sh
    git add -A
    git commit -q -m "missing harness regression script"
    scripts/validate-harness.sh >/tmp/harness-missing-test.out 2>/tmp/harness-missing-test.err
  )
}

case_harness_test_skip_record_passes() {
  local repo="${tmp_root}/harness-skip"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-skip"
    write_common_workspace "$workspace" "complete" "passed-with-skips" "accepted" "$base"
    append_sot_proposal "$workspace" "docs/harness-fixture-skip.md"
    echo "# Harness fixture skip" > docs/harness-fixture-skip.md
    cat >> "${workspace}/quality.md" <<'EOF_SKIP'

## Harness Test Update Gate

- Harness test impact: skipped
- Reason: fixture represents wording-only harness documentation change
- Validation command/result: `scripts/validate-harness.sh --strict` pass
EOF_SKIP
    git add docs/harness-fixture-skip.md "$workspace"
    git commit -q -m "harness skip fixture"
    scripts/validate-harness.sh --strict >/tmp/harness-skip.out 2>/tmp/harness-skip.err
  )
}

run_expect_success "valid complete workspace passes" case_valid_workspace_passes
run_expect_failure "unresolved Source of Truth proposal fails" case_unresolved_sot_fails
run_expect_success "deferred Source of Truth proposal passes" case_deferred_sot_passes
run_expect_failure "PR link exists but pushed branch missing fails" case_pr_link_without_branch_fails
run_expect_failure "complete workspace with missing pre-merge sync fails" case_missing_premerge_fails
run_expect_success "status workflow reports Source of Truth proposal status" case_status_reports_sot
run_expect_success "existing PR status does not recommend auto PR" case_existing_pr_status_does_not_recommend_auto_pr
run_expect_success "complete PR-ready status requires Pre-PR checkpoint" case_complete_pr_ready_status_requires_pre_pr_checkpoint
run_expect_success "prepare-pr check stays local" case_prepare_pr_check_is_local
run_expect_success "prepare-pr documents approved PR helper" case_prepare_pr_documents_approved_pr
run_expect_success "docs branch remote and tracking status is reported" case_docs_branch_remote_tracking_is_reported
run_expect_failure "missing harness regression script fails validation" case_missing_harness_test_script_fails
run_expect_success "harness test skip record passes" case_harness_test_skip_record_passes

printf 'Harness regression tests passed: %s\n' "$test_count"
