#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=scripts/lib/portable-tools.sh
source "${repo_root}/scripts/lib/portable-tools.sh"
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

## PR Conflict Confirm / PR 충돌 확인

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

## PR Conflict Resolution

- conflict detected at:
- conflict detection command:
- conflict type:
- affected files:
- resolution path:
- resolved files:
- revalidation:
- remaining risk:

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

install_fake_gh() {
  local repo="$1"
  local bin_dir="${repo}/fake-bin"
  mkdir -p "$bin_dir"
  cat > "${bin_dir}/gh" <<'EOF_GH'
#!/usr/bin/env bash
set -euo pipefail

case "${1:-}" in
  auth)
    [[ "${2:-}" == "status" ]] && exit 0
    ;;
  pr)
    case "${2:-}" in
      list)
        exit 0
        ;;
      view)
        if [[ "$*" == *"--json url"* ]]; then
          if [[ "${*: -2:1}" == "--jq" ]]; then
            printf 'https://github.com/JUNGLE-TEAM1/NMM_team1/pull/99\n'
          else
            printf '{"url":"https://github.com/JUNGLE-TEAM1/NMM_team1/pull/99"}\n'
          fi
        elif [[ "${*: -2:1}" == "--jq" ]]; then
          printf '%s\n' "${FAKE_GH_PR_STATE:-MERGED}"
        else
          printf '{"state":"%s"}\n' "${FAKE_GH_PR_STATE:-MERGED}"
        fi
        exit 0
        ;;
      create)
        printf 'https://github.com/JUNGLE-TEAM1/NMM_team1/pull/99\n'
        exit 0
        ;;
    esac
    ;;
  issue)
    case "${2:-}" in
      create)
        if [[ -n "${FAKE_GH_LOG:-}" ]]; then
          printf '%s\n' "$*" >> "$FAKE_GH_LOG"
        fi
        if [[ -n "${FAKE_GH_BODY_LOG:-}" ]]; then
          body_file=""
          while [[ $# -gt 0 ]]; do
            case "$1" in
              --body-file)
                body_file="${2:-}"
                shift 2
                ;;
              *)
                shift
                ;;
            esac
          done
          if [[ -n "$body_file" && -f "$body_file" ]]; then
            cat "$body_file" > "$FAKE_GH_BODY_LOG"
          fi
        fi
        printf 'https://github.com/JUNGLE-TEAM1/NMM_team1/issues/123\n'
        exit 0
        ;;
      view)
        if [[ "${*: -2:1}" == "--jq" ]]; then
          printf '%s\n' "${FAKE_GH_ISSUE_STATE:-CLOSED}"
        else
          printf '{"state":"%s"}\n' "${FAKE_GH_ISSUE_STATE:-CLOSED}"
        fi
        exit 0
        ;;
      close)
        exit 0
        ;;
      reopen)
        if [[ -n "${FAKE_GH_LOG:-}" ]]; then
          printf '%s\n' "$*" >> "$FAKE_GH_LOG"
        fi
        if [[ "${FAKE_GH_REOPEN_FAIL:-0}" == "1" ]]; then
          printf 'fake reopen failure\n' >&2
          exit 1
        fi
        exit 0
        ;;
    esac
    ;;
  project)
    case "${2:-}" in
      item-add)
        if [[ -n "${FAKE_GH_LOG:-}" ]]; then
          printf '%s\n' "$*" >> "$FAKE_GH_LOG"
        fi
        if [[ "${*: -2:1}" == "--jq" ]]; then
          printf 'PVTI_fake\n'
        else
          printf '{"id":"PVTI_fake","type":"Issue"}\n'
        fi
        exit 0
        ;;
      view)
        if [[ "${*: -2:1}" == "--jq" ]]; then
          printf 'PVT_fake\n'
        else
          printf '{"id":"PVT_fake"}\n'
        fi
        exit 0
        ;;
      field-list)
        if [[ "${*: -2:1}" == "--jq" ]]; then
          if [[ "$*" == *"Done"* ]]; then
            printf 'PVTSSF_fake\t5e543244\n'
          elif [[ "$*" == *"Review"* ]]; then
            printf 'PVTSSF_fake\t209b4527\n'
          else
            printf 'PVTSSF_fake\t98236657\n'
          fi
        else
          printf '{"fields":[{"id":"PVTSSF_fake","name":"Status","options":[{"id":"98236657","name":"In Progress"},{"id":"209b4527","name":"Review"},{"id":"5e543244","name":"Done"}]}]}\n'
        fi
        exit 0
        ;;
      item-edit)
        if [[ -n "${FAKE_GH_LOG:-}" ]]; then
          printf '%s\n' "$*" >> "$FAKE_GH_LOG"
        fi
        exit 0
        ;;
    esac
    ;;
esac

printf 'fake gh: unsupported command: %s\n' "$*" >&2
exit 1
EOF_GH
  chmod +x "${bin_dir}/gh"
  printf '%s\n' "$bin_dir"
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
    ASKLAKE_FORCE_PORTABLE_RG=1 scripts/validate-harness.sh --strict >/tmp/harness-valid.out 2>/tmp/harness-valid.err
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
    ASKLAKE_FORCE_PORTABLE_RG=1 scripts/status-workflow.sh "$workspace" > /tmp/harness-status.out
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

case_status_uses_remote_pr_state_for_stale_sync() {
  local repo="${tmp_root}/remote-pr-status"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-remote-pr-status"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    awk '
      /^- pushed branch:/ { print "- pushed branch: test/harness-remote-pr-status"; next }
      /^- PR link:/ { print "- PR link: https://example.invalid/pull/99"; next }
      /^- merge status:/ { print "- merge status: open"; next }
      /^- issue close status:/ { print "- issue close status: open"; next }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    git add "$workspace"
    git commit -q -m "remote pr status fixture"
    scripts/status-workflow.sh "$workspace" > /tmp/harness-remote-pr-status.out
    rg -q "Remote PR state: MERGED" /tmp/harness-remote-pr-status.out
    rg -q "Remote issue state: CLOSED" /tmp/harness-remote-pr-status.out
    rg -q "Stale sync warning: sync.md merge status 'open' differs from GitHub PR state 'MERGED'" /tmp/harness-remote-pr-status.out
    rg -q "Phase is merged and linked issue is closed according to GitHub" /tmp/harness-remote-pr-status.out
    ! rg -q "PR이 이미 열려 있습니다" /tmp/harness-remote-pr-status.out
  )
}

case_status_does_not_warn_on_state_case_only_difference() {
  local repo="${tmp_root}/remote-pr-status-case"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    FAKE_GH_PR_STATE="OPEN"
    FAKE_GH_ISSUE_STATE="OPEN"
    export FAKE_GH_PR_STATE FAKE_GH_ISSUE_STATE
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-remote-pr-status-case"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    awk '
      /^- pushed branch:/ { print "- pushed branch: test/harness-remote-pr-status-case"; next }
      /^- PR link:/ { print "- PR link: https://example.invalid/pull/99"; next }
      /^- merge status:/ { print "- merge status: open"; next }
      /^- issue close status:/ { print "- issue close status: open"; next }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    git add "$workspace"
    git commit -q -m "remote pr status case fixture"
    scripts/status-workflow.sh "$workspace" > /tmp/harness-remote-pr-status-case.out
    ! rg -q "Stale sync warning" /tmp/harness-remote-pr-status-case.out
  )
}

case_status_reports_open_pr_closed_issue_mismatch() {
  local repo="${tmp_root}/open-pr-closed-issue"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    FAKE_GH_PR_STATE="OPEN"
    FAKE_GH_ISSUE_STATE="CLOSED"
    export FAKE_GH_PR_STATE FAKE_GH_ISSUE_STATE
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-open-pr-closed-issue"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    awk '
      /^- pushed branch:/ { print "- pushed branch: test/harness-open-pr-closed-issue"; next }
      /^- PR link:/ { print "- PR link: https://example.invalid/pull/99"; next }
      /^- merge status:/ { print "- merge status: open"; next }
      /^- issue close status:/ { print "- issue close status: open"; next }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    git add "$workspace"
    git commit -q -m "open pr closed issue fixture"
    scripts/status-workflow.sh "$workspace" > /tmp/harness-open-pr-closed-issue.out
    rg -q "Open PR / closed issue mismatch: yes" /tmp/harness-open-pr-closed-issue.out
    rg -q "PR merge 전 Done/close가 선행된 이상 상태" /tmp/harness-open-pr-closed-issue.out
    ! rg -q "PR이 이미 열려 있습니다" /tmp/harness-open-pr-closed-issue.out
  )
}

case_list_active_uses_remote_pr_state_for_stale_sync() {
  local repo="${tmp_root}/remote-pr-queue"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    local source_branch
    source_branch="$(git branch --show-current)"
    git checkout -q -b test/harness-remote-pr-queue
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-remote-pr-queue"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    awk '
      /^- current branch:/ { print "- current branch: test/harness-remote-pr-queue"; next }
      /^- pushed branch:/ { print "- pushed branch: test/harness-remote-pr-queue"; next }
      /^- PR link:/ { print "- PR link: https://example.invalid/pull/99"; next }
      /^- merge status:/ { print "- merge status: open"; next }
      /^- issue close status:/ { print "- issue close status: open"; next }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    git add "$workspace"
    git commit -q -m "remote pr queue fixture"
    git checkout -q "$source_branch"
    scripts/list-active-branches.sh > /tmp/harness-remote-pr-queue.out
    rg -q 'test/harness-remote-pr-queue.*MERGED' /tmp/harness-remote-pr-queue.out
    rg -q 'merged cleanup candidate' /tmp/harness-remote-pr-queue.out
    rg -q 'GitHub says merged/closed' /tmp/harness-remote-pr-queue.out
    ! rg -q 'test/harness-remote-pr-queue.*prepare PR or hold with reason' /tmp/harness-remote-pr-queue.out
  )
}

case_complete_pr_ready_status_recommends_auto_pr_then_checkpoint() {
  local repo="${tmp_root}/auto-pr-checkpoint-status"
  copy_repo "$repo"
  (
    cd "$repo"
    git checkout -q -b test/harness-fixture
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-fixture"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    git add "$workspace"
    git commit -q -m "auto pr checkpoint status fixture"
    scripts/status-workflow.sh "$workspace" > /tmp/harness-auto-pr-checkpoint-status.out
    rg -q "자동 PR 생성 대상입니다" /tmp/harness-auto-pr-checkpoint-status.out
    rg -q -- "--auto-pr" /tmp/harness-auto-pr-checkpoint-status.out
    rg -q "Pre-PR Human Checkpoint" /tmp/harness-auto-pr-checkpoint-status.out
  )
}

case_remote_reconciliation_status_recommends_auto_pr() {
  local repo="${tmp_root}/remote-reconciliation-auto-pr"
  copy_repo "$repo"
  (
    cd "$repo"
    git checkout -q -b test/remote-reconciliation-auto-pr
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/remote-reconciliation-auto-pr"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    cat >> "${workspace}/report.md" <<'EOF_REMOTE'

## Remote operations reconciliation

- Remote state changed: GitHub Project issue status was manually reconciled.
- Harness codified: scripts and docs now reproduce the state transition.
EOF_REMOTE
    git add "$workspace"
    git commit -q -m "remote reconciliation fixture"
    scripts/status-workflow.sh "$workspace" > /tmp/harness-remote-reconciliation-auto-pr.out
    rg -q "remote operations reconciliation recorded: yes" /tmp/harness-remote-reconciliation-auto-pr.out
    rg -q "원격 운영 상태 보정이 하네스 변경으로 재현 가능하게 기록된 complete + PR-ready workspace입니다" /tmp/harness-remote-reconciliation-auto-pr.out
    rg -q -- "--auto-pr" /tmp/harness-remote-reconciliation-auto-pr.out
  )
}

case_status_reports_pr_conflict_priority() {
  local repo="${tmp_root}/pr-conflict-status"
  copy_repo "$repo"
  (
    cd "$repo"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-pr-conflict"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    awk '
      /^- conflict detected at:/ { print "- conflict detected at: 2026-06-24"; next }
      /^- conflict detection command:/ { print "- conflict detection command: gh pr view 99 --json mergeable"; next }
      /^- conflict type:/ { print "- conflict type: Git text conflict"; next }
      /^- affected files:/ { print "- affected files: docs/11-git-sync-policy.md"; next }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    git add "$workspace"
    git commit -q -m "pr conflict status fixture"
    scripts/status-workflow.sh "$workspace" > /tmp/harness-pr-conflict-status.out
    rg -q "PR Conflict" /tmp/harness-pr-conflict-status.out
    rg -q "Conflict type: Git text conflict" /tmp/harness-pr-conflict-status.out
    rg -q "PR Conflict Confirm" /tmp/harness-pr-conflict-status.out
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
    rg -q "## 1\\. PR 요약" /tmp/harness-prepare-pr.out
    rg -q "## 2\\. 변경 내용" /tmp/harness-prepare-pr.out
    rg -q "## 3\\. 검증" /tmp/harness-prepare-pr.out
    rg -q "## 4\\. 영향 범위" /tmp/harness-prepare-pr.out
    rg -q "## 5\\. 리뷰어에게 부탁할 부분" /tmp/harness-prepare-pr.out
    rg -q "## 6\\. 남은 일 / 제외한 일" /tmp/harness-prepare-pr.out
    rg -q "## 7\\. Merge 전 확인" /tmp/harness-prepare-pr.out
    rg -q "fixture" /tmp/harness-prepare-pr.out
    rg -q "이번 PR에서 아직 남은 일 또는 제외한 일은 다음과 같다\\. none" /tmp/harness-prepare-pr.out
    rg -q "마지막으로 남은 위험을 확인해 주세요\\. none" /tmp/harness-prepare-pr.out
    rg -q -- "- 연결된 Issue: Closes #1" /tmp/harness-prepare-pr.out
    rg -q -- "- Branch: \`test/harness-fixture\`" /tmp/harness-prepare-pr.out
    rg -q -- "- Branch workspace: \`${workspace}\`" /tmp/harness-prepare-pr.out
    rg -q -- "- Quality gate status: passed" /tmp/harness-prepare-pr.out
    rg -q -- "- Pre-Merge 또는 Pre-PR Sync: ready for PR preparation" /tmp/harness-prepare-pr.out

    awk '
      /^- linked GitHub issue:/ { print "- linked GitHub issue:"; next }
      /^- issue link:/ { print "- issue link:"; next }
      /^- PR closing keyword:/ { print "- PR closing keyword:"; next }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    scripts/prepare-pr.sh --dry-run "$workspace" >/tmp/harness-prepare-pr-no-issue.out
    rg -q -- "- 연결된 Issue: 연결된 issue 없음" /tmp/harness-prepare-pr-no-issue.out
    rg -q "이번 PR은 Harness fixture report 작업을 리뷰 가능한 상태로 인계한다\\." /tmp/harness-prepare-pr-no-issue.out
    rg -q -- "- PR readiness from \`scripts/status-workflow.sh\`: \`scripts/status-workflow.sh ${workspace}\` PR handoff 전 확인 필요" /tmp/harness-prepare-pr-no-issue.out
  )
}

case_prepare_pr_documents_auto_pr() {
  local repo="${tmp_root}/prepare-pr-approved"
  copy_repo "$repo"
  (
    cd "$repo"
    scripts/prepare-pr.sh --help > /tmp/harness-prepare-pr-help.out
    rg -q -- "--auto-pr" /tmp/harness-prepare-pr-help.out
    rg -q -- "--approved-pr" /tmp/harness-prepare-pr-help.out
    rg -q "compatibility alias for --auto-pr" /tmp/harness-prepare-pr-help.out
    rg -q -- "--auto-pr" docs/11-git-sync-policy.md
  )
}

case_start_workflow_checkpoint_excludes_untracked() {
  local repo="${tmp_root}/checkpoint-excludes-untracked"
  copy_repo "$repo"
  (
    cd "$repo"
    local source_branch
    source_branch="$(git branch --show-current)"
    echo "tracked checkpoint change" >> README.md
    echo "local artifact" > .DS_Store
    echo "personal draft" > docs/reports/personal-draft.md
    scripts/start-workflow.sh --no-issue docs checkpoint-target "Checkpoint target" > /tmp/harness-checkpoint.out

    git show --name-only --pretty='' "$source_branch" > /tmp/harness-checkpoint-files.out
    rg -q '^README.md$' /tmp/harness-checkpoint-files.out
    ! rg -q '(^|/)\.DS_Store$' /tmp/harness-checkpoint-files.out
    ! rg -q '^docs/reports/personal-draft\.md$' /tmp/harness-checkpoint-files.out
    rg -q "Untracked files are not included" /tmp/harness-checkpoint.out
    test -f .DS_Store
    test -f docs/reports/personal-draft.md
  )
}

case_start_workflow_adds_created_issue_to_project() {
  local repo="${tmp_root}/start-workflow-project"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    FAKE_GH_LOG="/tmp/harness-start-workflow-project-gh.log"
    FAKE_GH_BODY_LOG="/tmp/harness-start-workflow-project-body.md"
    export FAKE_GH_LOG FAKE_GH_BODY_LOG
    rm -f "$FAKE_GH_LOG" "$FAKE_GH_BODY_LOG"

    scripts/start-workflow.sh --no-checkout feature project-linked "Project linked" > /tmp/harness-start-workflow-project.out

    test -f "$FAKE_GH_LOG"
    test -f "$FAKE_GH_BODY_LOG"
    rg -q -- "issue create --title \\[기능\\] Project linked --body-file" "$FAKE_GH_LOG"
    rg -q -- "--label feature" "$FAKE_GH_LOG"
    rg -q -- "project item-add 3 --owner JUNGLE-TEAM1 --url https://github.com/JUNGLE-TEAM1/NMM_team1/issues/123 --format json --jq .id" "$FAKE_GH_LOG"
    rg -q -- "project item-edit --id PVTI_fake --project-id PVT_fake --field-id PVTSSF_fake --single-select-option-id 98236657" "$FAKE_GH_LOG"
    rg -q "## 1\\. 이슈 요약" "$FAKE_GH_BODY_LOG"
    rg -q "## 5\\. 관련 문서 / Source of Truth" "$FAKE_GH_BODY_LOG"
    rg -q "## 6\\. Acceptance Criteria" "$FAKE_GH_BODY_LOG"
    rg -q "## 7\\. Regression / Failure Scenario" "$FAKE_GH_BODY_LOG"
    rg -q "## 8\\. Manual Verification" "$FAKE_GH_BODY_LOG"
    rg -q -- "- Branch: \`feature/project-linked\`" "$FAKE_GH_BODY_LOG"
    rg -q -- "- Branch workspace: \`docs/workflows/feature/project-linked\`" "$FAKE_GH_BODY_LOG"
    ! rg -q '\\n' "$FAKE_GH_BODY_LOG"
    rg -q -- "- linked GitHub issue: #123" docs/workflows/feature/project-linked/sync.md
    rg -q -- "- issue project result: added to JUNGLE-TEAM1 project 3; status set to In Progress" docs/workflows/feature/project-linked/sync.md
  )
}

case_start_workflow_docs_issue_uses_korean_labels() {
  local repo="${tmp_root}/start-workflow-docs-issue"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    FAKE_GH_LOG="/tmp/harness-start-workflow-docs-gh.log"
    FAKE_GH_BODY_LOG="/tmp/harness-start-workflow-docs-body.md"
    export FAKE_GH_LOG FAKE_GH_BODY_LOG
    rm -f "$FAKE_GH_LOG" "$FAKE_GH_BODY_LOG"

    scripts/start-workflow.sh --no-checkout docs korean-template "한국어 템플릿 보강" > /tmp/harness-start-workflow-docs.out

    rg -q -- "issue create --title \\[문서/운영\\] 한국어 템플릿 보강 --body-file" "$FAKE_GH_LOG"
    rg -q -- "--label documentation" "$FAKE_GH_LOG"
    rg -q -- "--label ops" "$FAKE_GH_LOG"
    rg -q "## 1\\. 이슈 요약" "$FAKE_GH_BODY_LOG"
    rg -q "작업 유형: 문서/운영 개선" "$FAKE_GH_BODY_LOG"
    ! rg -q '## AskLake branch workspace|## Scope' "$FAKE_GH_BODY_LOG"
    ! rg -q '\\n' "$FAKE_GH_BODY_LOG"
  )
}

case_prepare_pr_create_sets_project_review() {
  local repo="${tmp_root}/prepare-pr-project-review"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    FAKE_GH_LOG="/tmp/harness-prepare-pr-project-review-gh.log"
    FAKE_GH_ISSUE_STATE="OPEN"
    export FAKE_GH_LOG FAKE_GH_ISSUE_STATE
    rm -f "$FAKE_GH_LOG"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-project-review"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    git add "$workspace"
    git commit -q -m "project review fixture"

    scripts/prepare-pr.sh --create-pr "$workspace" > /tmp/harness-prepare-pr-project-review.out

    test -f "$FAKE_GH_LOG"
    ! rg -q -- "issue reopen 1" "$FAKE_GH_LOG"
    rg -q -- "project item-add 3 --owner JUNGLE-TEAM1 --url https://github.com/JUNGLE-TEAM1/NMM_team1/issues/1 --format json --jq .id" "$FAKE_GH_LOG"
    rg -q -- "project item-edit --id PVTI_fake --project-id PVT_fake --field-id PVTSSF_fake --single-select-option-id 209b4527" "$FAKE_GH_LOG"
    rg -q -- "- PR link: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/99" "$workspace/sync.md"
    rg -q -- "- issue close status: open" "$workspace/sync.md"
    rg -q -- "- issue reopen result: already open" "$workspace/sync.md"
    rg -q -- "- issue project result: set to Review in JUNGLE-TEAM1 project 3" "$workspace/sync.md"
  )
}

case_prepare_pr_reopens_closed_issue_before_project_review() {
  local repo="${tmp_root}/prepare-pr-reopen-closed-issue"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    FAKE_GH_LOG="/tmp/harness-prepare-pr-reopen-closed-gh.log"
    FAKE_GH_ISSUE_STATE="CLOSED"
    export FAKE_GH_LOG FAKE_GH_ISSUE_STATE
    rm -f "$FAKE_GH_LOG"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-reopen-closed"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    git add "$workspace"
    git commit -q -m "reopen closed issue fixture"

    scripts/prepare-pr.sh --create-pr "$workspace" > /tmp/harness-prepare-pr-reopen-closed.out

    test -f "$FAKE_GH_LOG"
    rg -q -- "issue reopen 1 --comment" "$FAKE_GH_LOG"
    rg -q -- "project item-edit --id PVTI_fake --project-id PVT_fake --field-id PVTSSF_fake --single-select-option-id 209b4527" "$FAKE_GH_LOG"
    rg -q -- "- issue reopen result: reopened closed issue before PR open" "$workspace/sync.md"
    rg -q -- "- issue close status: open" "$workspace/sync.md"
    rg -q -- "- issue project result: set to Review in JUNGLE-TEAM1 project 3" "$workspace/sync.md"
  )
}

case_prepare_pr_records_reopen_failure_before_project_review() {
  local repo="${tmp_root}/prepare-pr-reopen-failure"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    FAKE_GH_LOG="/tmp/harness-prepare-pr-reopen-failure-gh.log"
    FAKE_GH_ISSUE_STATE="CLOSED"
    FAKE_GH_REOPEN_FAIL="1"
    export FAKE_GH_LOG FAKE_GH_ISSUE_STATE FAKE_GH_REOPEN_FAIL
    rm -f "$FAKE_GH_LOG"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-reopen-failure"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    git add "$workspace"
    git commit -q -m "reopen failure fixture"

    scripts/prepare-pr.sh --create-pr "$workspace" > /tmp/harness-prepare-pr-reopen-failure.out

    test -f "$FAKE_GH_LOG"
    rg -q -- "issue reopen 1 --comment" "$FAKE_GH_LOG"
    rg -q -- "- PR link: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/99" "$workspace/sync.md"
    rg -q -- "- issue reopen result: reopen failed: fake reopen failure" "$workspace/sync.md"
    rg -q -- "- issue close status: open" "$workspace/sync.md"
    rg -q -- "- issue project result: set to Review in JUNGLE-TEAM1 project 3" "$workspace/sync.md"
  )
}

case_prepare_pr_close_issue_sets_project_done() {
  local repo="${tmp_root}/prepare-pr-project-done"
  copy_repo "$repo"
  (
    cd "$repo"
    local fake_bin
    fake_bin="$(install_fake_gh "$repo")"
    PATH="${fake_bin}:$PATH"
    FAKE_GH_LOG="/tmp/harness-prepare-pr-project-done-gh.log"
    export FAKE_GH_LOG
    rm -f "$FAKE_GH_LOG"
    local base
    base="$(base_commit)"
    local workspace="docs/workflows/test/harness-project-done"
    write_common_workspace "$workspace" "complete" "passed" "accepted" "$base"
    awk '
      /^- pushed branch:/ { print "- pushed branch: test/harness-project-done"; next }
      /^- PR link:/ { print "- PR link: https://example.invalid/pull/99"; next }
      /^- merge status:/ { print "- merge status: open"; next }
      /^- issue close status:/ { print "- issue close status: open"; next }
      { print }
    ' "${workspace}/sync.md" > "${workspace}/sync.md.tmp"
    mv "${workspace}/sync.md.tmp" "${workspace}/sync.md"
    git add "$workspace"
    git commit -q -m "project done fixture"

    scripts/prepare-pr.sh --close-issue "$workspace" > /tmp/harness-prepare-pr-project-done.out

    test -f "$FAKE_GH_LOG"
    rg -q -- "project item-add 3 --owner JUNGLE-TEAM1 --url https://github.com/JUNGLE-TEAM1/NMM_team1/issues/1 --format json --jq .id" "$FAKE_GH_LOG"
    rg -q -- "project item-edit --id PVTI_fake --project-id PVT_fake --field-id PVTSSF_fake --single-select-option-id 5e543244" "$FAKE_GH_LOG"
    rg -q -- "- issue close status: CLOSED" "$workspace/sync.md"
    rg -q -- "- issue project result: set to Done in JUNGLE-TEAM1 project 3" "$workspace/sync.md"
  )
}

case_product_context_guard_missing_trust_loop_fails() {
  local repo="${tmp_root}/product-context-missing-loop"
  copy_repo "$repo"
  (
    cd "$repo"
    perl -0pi -e 's/Trusted Dataset -> Query\/Ask -> Evidence -> Recovery/Trusted Dataset -> Evidence/g' README.md
    git add README.md
    git commit -q -m "remove target trust loop from readme"
    scripts/validate-harness.sh --strict >/tmp/harness-product-context.out 2>/tmp/harness-product-context.err
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
run_expect_success "status workflow uses remote PR state for stale sync" case_status_uses_remote_pr_state_for_stale_sync
run_expect_success "status workflow ignores state case-only differences" case_status_does_not_warn_on_state_case_only_difference
run_expect_success "status workflow reports open PR closed issue mismatch" case_status_reports_open_pr_closed_issue_mismatch
run_expect_success "branch queue uses remote PR state for stale sync" case_list_active_uses_remote_pr_state_for_stale_sync
run_expect_success "complete PR-ready status recommends auto PR then checkpoint" case_complete_pr_ready_status_recommends_auto_pr_then_checkpoint
run_expect_success "remote reconciliation status recommends auto PR" case_remote_reconciliation_status_recommends_auto_pr
run_expect_success "status workflow prioritizes PR conflict resolution" case_status_reports_pr_conflict_priority
run_expect_success "prepare-pr check stays local" case_prepare_pr_check_is_local
run_expect_success "prepare-pr documents auto PR helper" case_prepare_pr_documents_auto_pr
run_expect_success "start-workflow checkpoint excludes untracked files" case_start_workflow_checkpoint_excludes_untracked
run_expect_success "start-workflow adds created issue to project" case_start_workflow_adds_created_issue_to_project
run_expect_success "start-workflow docs issue uses Korean template labels" case_start_workflow_docs_issue_uses_korean_labels
run_expect_success "prepare-pr create PR sets project Review" case_prepare_pr_create_sets_project_review
run_expect_success "prepare-pr reopens closed issue before project Review" case_prepare_pr_reopens_closed_issue_before_project_review
run_expect_success "prepare-pr records reopen failure before project Review" case_prepare_pr_records_reopen_failure_before_project_review
run_expect_success "prepare-pr close issue sets project Done" case_prepare_pr_close_issue_sets_project_done
run_expect_failure "product context guard catches missing trust loop" case_product_context_guard_missing_trust_loop_fails
run_expect_success "docs branch remote and tracking status is reported" case_docs_branch_remote_tracking_is_reported
run_expect_failure "missing harness regression script fails validation" case_missing_harness_test_script_fails
run_expect_success "harness test skip record passes" case_harness_test_skip_record_passes

printf 'Harness regression tests passed: %s\n' "$test_count"
