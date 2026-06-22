#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/cleanup-merged-branches.sh [--dry-run]

Automatically cleans merged/closed workspace branches after PR finalize.
This script only deletes Git branch refs. It never deletes deploy, AWS, cloud,
database, or other external resources.
USAGE
}

dry_run=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a Git worktree." >&2
  exit 1
fi

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
workspace_branch_regex='^(feature|fix|docs|test|chore|hotfix)/'
remote_heads_file="$(mktemp)"
local_branches_file="$(mktemp)"
delete_remote_file="$(mktemp)"
delete_local_file="$(mktemp)"
trap 'rm -f "$remote_heads_file" "$local_branches_file" "$delete_remote_file" "$delete_local_file"' EXIT

git ls-remote --heads origin 2>/dev/null \
  | awk '{ sub("refs/heads/", "", $2); print $2 }' \
  | awk -v regex="$workspace_branch_regex" '$0 ~ regex { print }' \
  | sort > "$remote_heads_file" || true

git branch --format='%(refname:short)' \
  | awk -v regex="$workspace_branch_regex" '$0 ~ regex { print }' \
  | sort > "$local_branches_file"

echo "Merged Branch Cleanup"
echo "====================="
echo
echo "Current branch: ${current_branch:-detached}"

while IFS= read -r workspace; do
  [[ -d "$workspace" ]] || continue
  branch="${workspace#docs/workflows/}"
  sync_file="${workspace}/sync.md"
  [[ -f "$sync_file" ]] || continue
  [[ "$branch" =~ $workspace_branch_regex ]] || continue
  [[ "$branch" != "$current_branch" ]] || continue

  merge_status="$(section_value "$sync_file" "## Push / PR" "- merge status:")"
  issue_close_status="$(section_value "$sync_file" "## Push / PR" "- issue close status:")"
  [[ "$merge_status" =~ ^merged ]] || continue
  [[ "$issue_close_status" =~ ^CLOSED ]] || continue

  if grep -Fxq "$branch" "$remote_heads_file"; then
    printf '%s\n' "$branch" >> "$delete_remote_file"
  fi

  if grep -Fxq "$branch" "$local_branches_file"; then
    if git merge-base --is-ancestor "$branch" main 2>/dev/null; then
      printf '%s\n' "$branch" >> "$delete_local_file"
    else
      echo "Skip local ${branch}: not confirmed as ancestor of main." >&2
    fi
  fi
done < <(find docs/workflows -mindepth 2 -maxdepth 2 -type d | sort)

sort -u -o "$delete_remote_file" "$delete_remote_file"
sort -u -o "$delete_local_file" "$delete_local_file"

echo
echo "Remote delete targets"
if [[ -s "$delete_remote_file" ]]; then
  sed 's/^/  - /' "$delete_remote_file"
else
  echo "  - none"
fi

echo
echo "Local delete targets"
if [[ -s "$delete_local_file" ]]; then
  sed 's/^/  - /' "$delete_local_file"
else
  echo "  - none"
fi

if [[ "$dry_run" -eq 1 ]]; then
  echo
  echo "Dry run only. No branch refs changed."
  exit 0
fi

if [[ -s "$delete_remote_file" ]]; then
  xargs git push origin --delete < "$delete_remote_file"
fi

if [[ -s "$delete_local_file" ]]; then
  xargs git branch -d < "$delete_local_file"
fi

git fetch --prune

echo
echo "Cleanup verification"
scripts/list-active-branches.sh
echo
echo "Local workspace branches"
git branch --list 'feature/*'
git branch --list 'fix/*'
git branch --list 'docs/*'
git branch --list 'test/*'
git branch --list 'chore/*'
git branch --list 'hotfix/*'
echo
echo "Remote workspace branches"
git ls-remote --heads origin 'feature/*'
git ls-remote --heads origin 'fix/*'
git ls-remote --heads origin 'docs/*'
git ls-remote --heads origin 'test/*'
git ls-remote --heads origin 'chore/*'
git ls-remote --heads origin 'hotfix/*'
