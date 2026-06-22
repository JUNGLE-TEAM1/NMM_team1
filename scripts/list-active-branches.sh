#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/list-active-branches.sh

Read-only branch queue summary.
This script does not run pull, merge, rebase, push, PR creation, or branch deletion.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a Git worktree." >&2
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

current_branch="$(git branch --show-current 2>/dev/null || true)"
main_ref="origin/main"

echo "Active Branch Queue"
echo "==================="
echo
echo "Current branch: ${current_branch:-detached}"
echo "Base ref: ${main_ref}"
echo

open_pr_status="available"
open_pr_file="$(mktemp)"
trap 'rm -f "$open_pr_file"' EXIT

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  gh pr list --state open --json number,headRefName,url --jq '.[] | [.headRefName, .number, .url] | @tsv' > "$open_pr_file"
else
  open_pr_status="skipped: GitHub CLI unavailable or unauthenticated"
fi

echo "Open PRs"
if [[ "$open_pr_status" != "available" ]]; then
  echo "  - ${open_pr_status}"
elif [[ ! -s "$open_pr_file" ]]; then
  echo "  - none"
else
  awk -F '\t' '{ print "  - " $1 ": #" $2 " " $3 }' "$open_pr_file" | sort
fi
echo

echo "Branches"
printf '| Branch | Ahead | Workspace | State | Issue | PR | Merge | Issue Close | Category | Recommended Next Action |\n'
printf '| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |\n'

while IFS= read -r branch; do
  [[ "$branch" != "main" ]] || continue

  ahead="0"
  if git rev-parse --verify --quiet "$main_ref" >/dev/null; then
    ahead="$(git rev-list --count "${main_ref}..${branch}" 2>/dev/null || echo 0)"
  fi

  workspace="docs/workflows/${branch}"
  workspace_cell="missing"
  state="unknown"
  issue=""
  pr_link=""
  merge_status=""
  issue_close_status=""
  open_pr_info=""

  if [[ -d "$workspace" ]]; then
    workspace_cell="$workspace"
    [[ -f "${workspace}/report.md" ]] && state="$(first_value "${workspace}/report.md" "- Workspace state:")"
    if [[ -f "${workspace}/sync.md" ]]; then
      issue="$(section_value "${workspace}/sync.md" "## Push / PR" "- linked GitHub issue:")"
      pr_link="$(section_value "${workspace}/sync.md" "## Push / PR" "- PR link:")"
      merge_status="$(section_value "${workspace}/sync.md" "## Push / PR" "- merge status:")"
      issue_close_status="$(section_value "${workspace}/sync.md" "## Push / PR" "- issue close status:")"
    fi
  fi

  pr_cell="${pr_link:-}"
  if [[ -s "$open_pr_file" ]]; then
    open_pr_info="$(awk -F '\t' -v branch="$branch" '$1 == branch { print "#" $2 " " $3; exit }' "$open_pr_file")"
  fi
  if [[ -n "$open_pr_info" ]]; then
    pr_cell="$open_pr_info"
  fi

  category="active local branch"
  recommendation="run status-workflow and decide PR/hardening/hold"

  if [[ ! -d "$workspace" ]]; then
    category="no workspace / unknown"
    recommendation="inspect branch manually before action"
  elif [[ -n "$open_pr_info" ]]; then
    category="open PR branch"
    recommendation="check CI, review, merge/finalize when approved"
  elif [[ "$merge_status" =~ ^merged && "$issue_close_status" =~ ^CLOSED ]]; then
    category="merged cleanup candidate"
    recommendation="cleanup only after human approval"
  elif [[ "$ahead" -eq 0 && "$merge_status" =~ ^merged ]]; then
    category="merged cleanup candidate"
    recommendation="cleanup only after human approval"
  elif [[ "$ahead" -gt 0 ]]; then
    category="active local branch"
    recommendation="prepare PR or hold with reason"
  fi

  printf '| `%s` | %s | `%s` | %s | %s | %s | %s | %s | %s | %s |\n' \
    "$branch" \
    "$ahead" \
    "$workspace_cell" \
    "${state:-unknown}" \
    "${issue:-missing}" \
    "${pr_cell:-missing}" \
    "${merge_status:-missing}" \
    "${issue_close_status:-missing}" \
    "$category" \
    "$recommendation"
done < <(git branch --format='%(refname:short)' | sort)
