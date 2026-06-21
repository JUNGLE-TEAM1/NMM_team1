#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/prepare-pr.sh [--dry-run] [--push] [--create-pr] [--check-issue] docs/workflows/<type>/<short-kebab-name>

Default behavior updates the workspace sync.md with the PR closing keyword and prints a PR body draft.
Remote actions require explicit flags:
  --push        push the current branch to origin
  --create-pr   create a GitHub PR with gh
  --check-issue query linked GitHub issue state with gh
USAGE
}

dry_run=0
push_branch=0
create_pr=0
check_issue=0

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
    --check-issue)
      check_issue=1
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

current_branch="$(git branch --show-current 2>/dev/null || true)"
recorded_branch="$(first_value "$sync_file" "- current branch:")"
branch="${current_branch:-$recorded_branch}"

if [[ -z "$branch" || "$branch" == "not a git worktree" ]]; then
  echo "Cannot determine branch for PR handoff." >&2
  exit 1
fi

linked_issue="$(section_value "$sync_file" "## Push / PR" "- linked GitHub issue:")"
issue_number=""
if [[ "$linked_issue" =~ ^#([0-9]+)$ ]]; then
  issue_number="${BASH_REMATCH[1]}"
elif [[ "$linked_issue" =~ /issues/([0-9]+) ]]; then
  issue_number="${BASH_REMATCH[1]}"
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

  pr_output="$(gh pr create --title "$title" --body-file "$pr_body_file" 2>&1)"
  pr_link="$(printf '%s\n' "$pr_output" | tail -n 1)"
  set_field "$sync_file" "- PR link:" "$pr_link"
  echo "Created PR: ${pr_link}"
fi

if [[ "$check_issue" -eq 1 ]]; then
  if [[ -z "$issue_number" ]]; then
    echo "Cannot check issue state: linked GitHub issue is missing or unparseable." >&2
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

rm -f "$pr_body_file"
