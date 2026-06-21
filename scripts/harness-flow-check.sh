#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/harness-flow-check.sh [docs/workflows/<type>/<short-kebab-name>]

Runs the standard harness flow checks after applying an approved harness rule:
- shell syntax for scripts/*.sh
- scripts/validate-harness.sh
- scripts/validate-harness.sh --strict
- scripts/status-workflow.sh <workspace> when a workspace is provided
USAGE
}

workspace="${1:-}"

if [[ "${workspace}" == "-h" || "${workspace}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -gt 1 ]]; then
  usage
  exit 1
fi

echo "Harness Flow Check"
echo "=================="
echo

echo "Shell syntax"
while IFS= read -r -d '' script; do
  echo "  - bash -n ${script}"
  bash -n "$script"
done < <(find scripts -maxdepth 1 -type f -name '*.sh' -print0)
echo

echo "Harness validation"
echo "  - scripts/validate-harness.sh"
scripts/validate-harness.sh
echo "  - scripts/validate-harness.sh --strict"
scripts/validate-harness.sh --strict
echo

if [[ -n "$workspace" ]]; then
  echo "Workspace status"
  echo "  - scripts/status-workflow.sh ${workspace}"
  scripts/status-workflow.sh "$workspace"
else
  echo "Workspace status"
  echo "  - skipped: no workspace provided"
fi
