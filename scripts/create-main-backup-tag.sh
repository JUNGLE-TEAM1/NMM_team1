#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/create-main-backup-tag.sh [--dry-run] [--date YYYY-MM-DD]

Create and push a date-based backup tag for origin/main.

Default tag:
  backup/main-YYYY-MM-DD

If the tag already exists locally or on origin, the script uses:
  backup/main-YYYY-MM-DD-1
  backup/main-YYYY-MM-DD-2
  ...

Options:
  --dry-run        Show the tag that would be created without creating or pushing it.
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
tag_base="backup/main-${backup_date}"
tag_name="$tag_base"
suffix=0

tag_exists() {
  local candidate="$1"
  git rev-parse -q --verify "refs/tags/${candidate}" >/dev/null 2>&1 \
    || git ls-remote --exit-code --tags origin "refs/tags/${candidate}" >/dev/null 2>&1
}

while tag_exists "$tag_name"; do
  suffix=$((suffix + 1))
  tag_name="${tag_base}-${suffix}"
done

tags_url="https://github.com/JUNGLE-TEAM1/NMM_team1/tags"

if [[ "$dry_run" -eq 1 ]]; then
  cat <<EOF
Dry run: no tag created.
Tag: ${tag_name}
Target: origin/main ${target_short}
Commit: ${target_commit}
GitHub Tags: ${tags_url}
EOF
  exit 0
fi

git tag "$tag_name" "$target_commit"
git push origin "$tag_name"

cat <<EOF
Created backup tag.
Tag: ${tag_name}
Target: origin/main ${target_short}
Commit: ${target_commit}
GitHub Tags: ${tags_url}
EOF
