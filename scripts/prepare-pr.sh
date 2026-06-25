#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/prepare-pr.sh [--dry-run] [--push] [--create-pr] [--auto-pr] [--approved-pr] [--check-issue] [--check-pr-sync] [--close-issue] [--finalize] docs/workflows/<type>/<short-kebab-name>

Default behavior updates the workspace sync.md with the PR closing keyword and prints a PR body draft.
Remote actions require explicit flags:
  --push        push the current branch to origin after PR-ready policy checks
  --create-pr   create a GitHub PR with gh after PR-ready policy checks
  --auto-pr     run PR sync check, push the branch, and create a PR for a PR-ready workspace
  --approved-pr compatibility alias for --auto-pr when a human explicitly requested PR creation
  --check-issue query linked GitHub issue state with gh
  --check-pr-sync check local sync.md PR handoff fields before creating or merging a PR
  --close-issue close linked issue after the recorded PR is merged
  --finalize    verify recorded PR is merged, close/check linked issue, update sync.md, and run automatic merged branch cleanup
USAGE
}

dry_run=0
push_branch=0
create_pr=0
approved_pr=0
check_issue=0
check_pr_sync=0
close_issue=0
finalize=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=1
      shift
      ;;
    --push)
      push_branch=1
      shift
      ;;
    --create-pr)
      create_pr=1
      shift
      ;;
    --approved-pr)
      approved_pr=1
      check_pr_sync=1
      push_branch=1
      create_pr=1
      shift
      ;;
    --auto-pr)
      approved_pr=1
      check_pr_sync=1
      push_branch=1
      create_pr=1
      shift
      ;;
    --check-issue)
      check_issue=1
      shift
      ;;
    --check-pr-sync)
      check_pr_sync=1
      shift
      ;;
    --close-issue)
      close_issue=1
      shift
      ;;
    --finalize)
      finalize=1
      check_pr_sync=1
      close_issue=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      break
      ;;
  esac
done

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

workspace="${1%/}"
sync_file="${workspace}/sync.md"
report_file="${workspace}/report.md"
plan_file="${workspace}/plan.md"

if [[ ! -f "$sync_file" ]]; then
  echo "sync.md not found: ${sync_file}" >&2
  exit 1
fi

first_value() {
  local file="$1"
  local label="$2"
  awk -v label="$label" '
    index($0, label) == 1 {
      value=$0
      sub(label "[ \t]*", "", value)
      gsub(/^[ \t]+|[ \t]+$/, "", value)
      print value
      exit
    }
  ' "$file"
}

section_value() {
  local file="$1"
  local section="$2"
  local label="$3"
  awk -v section="$section" -v label="$label" '
    $0 == section { in_section=1; next }
    /^## / && in_section { exit }
    in_section && index($0, label) == 1 {
      value=$0
      sub(label "[ \t]*", "", value)
      gsub(/^[ \t]+|[ \t]+$/, "", value)
      print value
      exit
    }
  ' "$file"
}

set_field() {
  local file="$1"
  local label="$2"
  local value="$3"
  local tmp
  tmp="$(mktemp)"
  awk -v label="$label" -v value="$value" '
    index($0, label) == 1 {
      print label " " value
      found=1
      next
    }
    { print }
    END {
      if (!found) {
        print label " " value
      }
    }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
}

emptyish() {
  case "$1" in
    ""|none|None|NONE|n/a|N/A|"not requested") return 0 ;;
    *) return 1 ;;
  esac
}

workspace_branch() {
  case "$workspace" in
    docs/workflows/*/*)
      local rest="${workspace#docs/workflows/}"
      printf '%s\n' "$rest"
      ;;
    *)
      return 1
      ;;
  esac
}

current_branch="$(git branch --show-current 2>/dev/null || true)"
recorded_branch="$(first_value "$sync_file" "- current branch:")"
if emptyish "$recorded_branch"; then
  recorded_branch=""
fi
expected_branch="$(workspace_branch || true)"
branch="${recorded_branch:-${expected_branch:-$current_branch}}"

if [[ -z "$branch" || "$branch" == "not a git worktree" ]]; then
  echo "Cannot determine branch for PR handoff." >&2
  exit 1
fi

linked_issue="$(section_value "$sync_file" "## Push / PR" "- linked GitHub issue:")"
pr_link="$(section_value "$sync_file" "## Push / PR" "- PR link:")"
pushed_branch="$(section_value "$sync_file" "## Push / PR" "- pushed branch:")"
merge_status="$(section_value "$sync_file" "## Push / PR" "- merge status:")"
issue_close_status="$(section_value "$sync_file" "## Push / PR" "- issue close status:")"
for field_name in linked_issue pr_link pushed_branch merge_status issue_close_status; do
  if emptyish "${!field_name}"; then
    printf -v "$field_name" '%s' ""
  fi
done
issue_number=""
if [[ "$linked_issue" =~ ^#([0-9]+)$ ]]; then
  issue_number="${BASH_REMATCH[1]}"
elif [[ "$linked_issue" =~ /issues/([0-9]+) ]]; then
  issue_number="${BASH_REMATCH[1]}"
fi

pr_number=""
if [[ "$pr_link" =~ /pull/([0-9]+) ]]; then
  pr_number="${BASH_REMATCH[1]}"
fi

closing_keyword=""
if [[ -n "$issue_number" ]]; then
  closing_keyword="Closes #${issue_number}"
fi

title="PR handoff for ${branch}"
if [[ -f "$report_file" ]]; then
  report_title="$(sed -n '1s/^# //p' "$report_file")"
  [[ -n "$report_title" ]] && title="$report_title"
elif [[ -f "$plan_file" ]]; then
  plan_title="$(sed -n '1s/^# //p' "$plan_file")"
  [[ -n "$plan_title" ]] && title="$plan_title"
fi

pr_body_file="$(mktemp)"
cat > "$pr_body_file" <<EOF_BODY
## Summary

- Workspace: \`${workspace}\`
- Branch: \`${branch}\`

## Issue

${closing_keyword:-No linked issue recorded.}

## Checklist

- [ ] \`scripts/status-workflow.sh ${workspace}\` reviewed
- [ ] \`scripts/validate-harness.sh\` passed
- [ ] \`scripts/validate-harness.sh --strict\` passed
EOF_BODY

echo "PR handoff"
echo "=========="
echo
echo "Workspace: ${workspace}"
echo "Branch: ${branch}"
echo "Linked issue: ${linked_issue:-none}"
echo "Closing keyword: ${closing_keyword:-none}"
echo "PR link: ${pr_link:-none}"
echo
echo "PR body draft:"
echo "--------------"
cat "$pr_body_file"
echo

if [[ "$dry_run" -eq 1 ]]; then
  echo "Dry run only. No files or remote state changed."
  rm -f "$pr_body_file"
  exit 0
fi

if [[ "$check_pr_sync" -eq 1 ]]; then
  sync_failures=0

  if [[ -n "$linked_issue" && -z "$closing_keyword" ]]; then
    echo "PR sync check failed: linked issue is recorded but PR closing keyword cannot be derived." >&2
    sync_failures=$((sync_failures + 1))
  fi

  if [[ -n "$linked_issue" ]] && [[ -z "$(section_value "$sync_file" "## Push / PR" "- PR closing keyword:")" ]]; then
    echo "PR sync check failed: linked issue exists but PR closing keyword is empty in sync.md." >&2
    sync_failures=$((sync_failures + 1))
  fi

  if [[ -n "$pr_link" && -z "$pushed_branch" ]]; then
    echo "PR sync check failed: PR link exists but pushed branch is empty in sync.md." >&2
    sync_failures=$((sync_failures + 1))
  fi

  if [[ -z "$pr_link" ]]; then
    case "$merge_status" in
      ""|"not created yet") ;;
      *) echo "PR sync check failed: merge status is '${merge_status}' before a PR link is recorded." >&2; sync_failures=$((sync_failures + 1)) ;;
    esac
    case "$issue_close_status" in
      ""|"not created yet") ;;
      *) echo "PR sync check failed: issue close status is '${issue_close_status}' before a PR link is recorded." >&2; sync_failures=$((sync_failures + 1)) ;;
    esac
  fi

  if [[ "$sync_failures" -gt 0 ]]; then
    rm -f "$pr_body_file"
    exit 1
  fi

  if [[ "$approved_pr" -eq 1 ]]; then
    workspace_state="$(first_value "$report_file" "- Workspace state:")"
    if [[ "$workspace_state" != "complete" && "$workspace_state" != "ready-for-review" && "$workspace_state" != "integration-ready" ]]; then
      echo "Approved PR failed: workspace state is '${workspace_state:-missing}', expected complete, ready-for-review, or integration-ready." >&2
      rm -f "$pr_body_file"
      exit 1
    fi
    if [[ -n "$expected_branch" && "$branch" != "$expected_branch" ]]; then
      echo "Approved PR failed: workspace '${workspace}' maps to branch '${expected_branch}', but sync.md/current branch resolved to '${branch}'." >&2
      rm -f "$pr_body_file"
      exit 1
    fi
    if [[ -n "$current_branch" && "$current_branch" != "$branch" ]]; then
      echo "Approved PR failed: current checkout branch is '${current_branch}', expected '${branch}'." >&2
      rm -f "$pr_body_file"
      exit 1
    fi
  fi

  echo "PR sync check passed."
fi

if [[ -n "$closing_keyword" ]]; then
  set_field "$sync_file" "- PR closing keyword:" "$closing_keyword"
fi

if [[ "$push_branch" -eq 1 ]]; then
  git push -u origin "$branch"
  set_field "$sync_file" "- pushed branch:" "$branch"
fi

if [[ "$create_pr" -eq 1 ]]; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "Cannot create PR: GitHub CLI is not available." >&2
    rm -f "$pr_body_file"
    exit 1
  fi

  if ! gh auth status >/dev/null 2>&1; then
    echo "Cannot create PR: GitHub CLI is not authenticated." >&2
    rm -f "$pr_body_file"
    exit 1
  fi

  if gh pr view "$branch" --json url --jq .url >/dev/null 2>&1; then
    pr_link="$(gh pr view "$branch" --json url --jq .url)"
    echo "Existing PR: ${pr_link}"
  else
    pr_output="$(gh pr create --title "$title" --body-file "$pr_body_file" 2>&1)"
    pr_link="$(printf '%s\n' "$pr_output" | tail -n 1)"
    echo "Created PR: ${pr_link}"
  fi
  set_field "$sync_file" "- PR link:" "$pr_link"
  set_field "$sync_file" "- merge status:" "open"
  if [[ -n "$issue_number" ]]; then
    set_field "$sync_file" "- issue close status:" "open"
  else
    set_field "$sync_file" "- issue close status:" "n/a"
  fi
fi

if [[ "$check_issue" -eq 1 || "$close_issue" -eq 1 || "$finalize" -eq 1 ]]; then
  if [[ -z "$issue_number" ]]; then
    if [[ "$check_issue" -eq 1 && "$finalize" -eq 0 ]]; then
      echo "Cannot check issue state: linked GitHub issue is missing or unparseable." >&2
    fi
    set_field "$sync_file" "- issue close status:" "n/a"
  elif ! command -v gh >/dev/null 2>&1; then
    echo "Cannot check issue state: GitHub CLI is not available." >&2
  elif ! gh auth status >/dev/null 2>&1; then
    echo "Cannot check issue state: GitHub CLI is not authenticated." >&2
  else
    issue_state="$(gh issue view "$issue_number" --json state --jq .state)"
    set_field "$sync_file" "- issue close status:" "$issue_state"
    echo "Issue #${issue_number} state: ${issue_state}"
  fi
fi

if [[ "$close_issue" -eq 1 || "$finalize" -eq 1 ]]; then
  if [[ -z "$issue_number" ]]; then
    if [[ "$finalize" -eq 0 ]]; then
      echo "Cannot close issue: linked GitHub issue is missing or unparseable." >&2
      rm -f "$pr_body_file"
      exit 1
    fi

    if [[ -z "$pr_number" ]]; then
      echo "Cannot finalize PR: PR link is missing or unparseable in sync.md." >&2
      rm -f "$pr_body_file"
      exit 1
    fi

    if ! command -v gh >/dev/null 2>&1; then
      echo "Cannot finalize PR: GitHub CLI is not available." >&2
      rm -f "$pr_body_file"
      exit 1
    fi

    if ! gh auth status >/dev/null 2>&1; then
      echo "Cannot finalize PR: GitHub CLI is not authenticated." >&2
      rm -f "$pr_body_file"
      exit 1
    fi

    pr_state="$(gh pr view "$pr_number" --json state --jq .state)"
    if [[ "$pr_state" != "MERGED" ]]; then
      echo "Cannot finalize PR: PR #${pr_number} state is ${pr_state}, expected MERGED." >&2
      rm -f "$pr_body_file"
      exit 1
    fi

    set_field "$sync_file" "- merge status:" "merged"
    set_field "$sync_file" "- issue close status:" "n/a"
    scripts/cleanup-merged-branches.sh
    rm -f "$pr_body_file"
    exit 0
  fi

  if [[ -z "$pr_number" ]]; then
    echo "Cannot close issue: PR link is missing or unparseable in sync.md." >&2
    rm -f "$pr_body_file"
    exit 1
  fi

  if ! command -v gh >/dev/null 2>&1; then
    echo "Cannot close issue: GitHub CLI is not available." >&2
    rm -f "$pr_body_file"
    exit 1
  fi

  if ! gh auth status >/dev/null 2>&1; then
    echo "Cannot close issue: GitHub CLI is not authenticated." >&2
    rm -f "$pr_body_file"
    exit 1
  fi

  pr_state="$(gh pr view "$pr_number" --json state --jq .state)"
  if [[ "$pr_state" != "MERGED" ]]; then
    echo "Cannot finalize issue: PR #${pr_number} state is ${pr_state}, expected MERGED." >&2
    rm -f "$pr_body_file"
    exit 1
  fi

  issue_state="$(gh issue view "$issue_number" --json state --jq .state)"
  if [[ "$issue_state" == "CLOSED" ]]; then
    set_field "$sync_file" "- merge status:" "merged"
    set_field "$sync_file" "- issue close status:" "CLOSED"
    echo "Issue #${issue_number} is already CLOSED."
  else
    gh issue close "$issue_number" --comment "Closed after PR #${pr_number} was merged. PR: ${pr_link}"
    set_field "$sync_file" "- merge status:" "merged"
    set_field "$sync_file" "- issue close status:" "CLOSED"
    echo "Closed issue #${issue_number} after PR #${pr_number} merge."
  fi

  if [[ "$finalize" -eq 1 ]]; then
    scripts/cleanup-merged-branches.sh
  fi
fi

rm -f "$pr_body_file"
