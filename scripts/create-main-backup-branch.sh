#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/create-main-backup-branch.sh [--dry-run] [--date YYYY-MM-DD]

Create and push a date-based protected backup branch for origin/main.

Default branch:
  backup/main-YYYY-MM-DD

If the branch already exists locally or on origin, the script uses:
  backup/main-YYYY-MM-DD-1
  backup/main-YYYY-MM-DD-2
  ...

The remote repository protects backup branches with the
`AskLake backup branch guardrails` ruleset for `refs/heads/backup/main-*`.

Options:
  --dry-run        Show the branch that would be created without creating or pushing it.
  --date DATE     Use DATE instead of today's date. DATE must look like YYYY-MM-DD.
  -h, --help      Show this help.
USAGE
}

dry_run=0
backup_date="$(date +%F)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=1
      shift
      ;;
    --date)
      if [[ $# -lt 2 ]]; then
        echo "--date requires a YYYY-MM-DD value." >&2
        exit 1
      fi
      backup_date="$2"
      shift 2
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

if [[ ! "$backup_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Invalid date: ${backup_date}. Expected YYYY-MM-DD." >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a Git worktree." >&2
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Missing origin remote." >&2
  exit 1
fi

git fetch origin

target_commit="$(git rev-parse origin/main)"
target_short="$(git rev-parse --short origin/main)"
branch_base="backup/main-${backup_date}"
branch_name="$branch_base"
suffix=0

branch_exists() {
  local candidate="$1"
  git rev-parse -q --verify "refs/heads/${candidate}" >/dev/null 2>&1 \
    || git ls-remote --exit-code --heads origin "refs/heads/${candidate}" >/dev/null 2>&1
}

while branch_exists "$branch_name"; do
  suffix=$((suffix + 1))
  branch_name="${branch_base}-${suffix}"
done

branches_url="https://github.com/JUNGLE-TEAM1/NMM_team1/branches/all?query=backup%2Fmain-"
ruleset_url="https://github.com/JUNGLE-TEAM1/NMM_team1/rules/18157634"

if [[ "$dry_run" -eq 1 ]]; then
  cat <<EOF
Dry run: no branch created.
Branch: ${branch_name}
Target: origin/main ${target_short}
Commit: ${target_commit}
Protection ruleset: ${ruleset_url}
GitHub Branches: ${branches_url}
EOF
  exit 0
fi

git push origin "${target_commit}:refs/heads/${branch_name}"

cat <<EOF
Created protected backup branch.
Branch: ${branch_name}
Target: origin/main ${target_short}
Commit: ${target_commit}
Protection ruleset: ${ruleset_url}
GitHub Branches: ${branches_url}
EOF
