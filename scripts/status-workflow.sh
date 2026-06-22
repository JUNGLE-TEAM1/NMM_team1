#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/status-workflow.sh [docs/workflows/<type>/<short-kebab-name>]

When no workspace path is provided, the script tries to infer it from the current Git branch.
This script only reads files. It does not run pull, merge, rebase, push, PR, or deploy commands.
USAGE
}

trim() {
  awk '{$1=$1; print}'
}

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

status_line() {
  local label="$1"
  local file="$2"
  if [[ -f "$file" ]]; then
    printf "  - %s: present\n" "$label"
  else
    printf "  - %s: missing\n" "$label"
  fi
}

infer_workspace() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    return 1
  fi

  local branch
  branch="$(git branch --show-current 2>/dev/null || true)"
  [[ -n "$branch" ]] || return 1
  printf 'docs/workflows/%s\n' "$branch"
}

workspace="${1:-}"

if [[ "${workspace}" == "-h" || "${workspace}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ -z "$workspace" ]]; then
  if ! workspace="$(infer_workspace)"; then
    echo "Cannot infer workspace outside a Git worktree or from a detached branch." >&2
    usage >&2
    exit 1
  fi
fi

workspace="${workspace%/}"

if [[ ! -d "$workspace" ]]; then
  echo "Workspace not found: ${workspace}" >&2
  exit 1
fi

plan="${workspace}/plan.md"
report="${workspace}/report.md"
shared_docs="${workspace}/shared-docs.md"
sources="${workspace}/sources.md"
confirmations="${workspace}/confirmations.md"
next_actions="${workspace}/next-actions.md"
sync_file="${workspace}/sync.md"
quality="${workspace}/quality.md"
decisions="${workspace}/decisions.md"

echo "Workspace Status"
echo "================"
echo
echo "Workspace: ${workspace}"
echo

workspace_state="missing"
if [[ -f "$report" ]]; then
  workspace_state="$(first_value "$report" "- Workspace state:")"
  workspace_state="${workspace_state:-draft}"
fi

quality_gate_status="missing"
if [[ -f "$quality" ]]; then
  quality_gate_status="$(first_value "$quality" "- Quality gate status:")"
  quality_gate_status="${quality_gate_status:-draft}"
fi

decision_status="missing"
if [[ -f "$decisions" ]]; then
  decision_status="$(first_value "$decisions" "- Decision status:")"
  decision_status="${decision_status:-none}"
fi

echo "State"
echo "  - Workspace state: ${workspace_state}"
echo "  - Quality gate status: ${quality_gate_status}"
echo "  - Decision status: ${decision_status}"
echo

echo "Files"
status_line "plan.md" "$plan"
status_line "report.md" "$report"
status_line "shared-docs.md" "$shared_docs"
status_line "sources.md" "$sources"
status_line "confirmations.md" "$confirmations"
status_line "next-actions.md" "$next_actions"
status_line "sync.md" "$sync_file"
status_line "quality.md" "$quality"
status_line "decisions.md" "$decisions"
echo

echo "Pending Confirmations"
if [[ -f "$confirmations" ]] && rg -n 'Status: pending' "$confirmations" >/dev/null 2>&1; then
  awk '
    /^## / { section=$0; sub(/^## /, "", section) }
    /Status: pending/ { print "  - " section }
  ' "$confirmations"
else
  echo "  - none"
fi
echo

echo "Git Sync"
if [[ -f "$sync_file" ]]; then
  start_base="$(first_value "$sync_file" "- base commit:")"
  start_result="$(first_value "$sync_file" "- result:")"
  pre_main="$(first_value "$sync_file" "- main commit:")"
  pre_result="$(section_value "$sync_file" "## Pre-Merge Sync" "- result:")"
  pre_deferral="$(section_value "$sync_file" "## Pre-Merge Sync" "- deferral reason:")"
  linked_issue="$(section_value "$sync_file" "## Push / PR" "- linked GitHub issue:")"
  issue_link="$(section_value "$sync_file" "## Push / PR" "- issue link:")"
  issue_creation_result="$(section_value "$sync_file" "## Push / PR" "- issue creation result:")"
  closing_keyword="$(section_value "$sync_file" "## Push / PR" "- PR closing keyword:")"
  pushed_branch="$(section_value "$sync_file" "## Push / PR" "- pushed branch:")"
  pr_link="$(section_value "$sync_file" "## Push / PR" "- PR link:")"
  merge_status="$(section_value "$sync_file" "## Push / PR" "- merge status:")"
  issue_close_status="$(section_value "$sync_file" "## Push / PR" "- issue close status:")"
  echo "  - Start Sync base commit: ${start_base:-missing}"
  echo "  - Start Sync result: ${start_result:-missing}"
  echo "  - Pre-Merge main commit: ${pre_main:-missing}"
  echo "  - Pre-Merge result: ${pre_result:-missing}"
  echo "  - Pre-Merge deferral: ${pre_deferral:-missing}"
  echo "  - Linked GitHub issue: ${linked_issue:-missing}"
  echo "  - Issue link: ${issue_link:-missing}"
  echo "  - Issue creation result: ${issue_creation_result:-missing}"
  echo "  - PR closing keyword: ${closing_keyword:-missing}"
  echo "  - Pushed branch: ${pushed_branch:-missing}"
  echo "  - PR link: ${pr_link:-missing}"
  echo "  - Merge status: ${merge_status:-missing}"
  echo "  - Issue close status: ${issue_close_status:-missing}"
else
  echo "  - sync.md missing"
fi
echo

echo "Quality"
if [[ -f "$quality" ]]; then
  tdd_applies="$(first_value "$quality" "- Applies:")"
  ci_required="$(first_value "$quality" "- CI required:")"
  ci_result="$(first_value "$quality" "- CI result:")"
  deploy_required="$(first_value "$quality" "- Deploy/publish required:")"
  echo "  - TDD applies: ${tdd_applies:-missing}"
  echo "  - Quality gate status: ${quality_gate_status}"
  echo "  - CI required: ${ci_required:-missing}"
  echo "  - CI result: ${ci_result:-missing}"
  echo "  - Deploy/publish required: ${deploy_required:-missing}"
else
  tdd_applies=""
  ci_required=""
  ci_result=""
  deploy_required=""
  echo "  - quality.md missing"
fi
echo

echo "Shared Source Of Truth"
if [[ -f "$shared_docs" ]] && awk -F '|' '
  /^\| `docs\// {
    value=$3 $4
    gsub(/^[ \t]+|[ \t]+$/, "", value)
    if (value != "") found=1
  }
  END { exit found ? 0 : 1 }
' "$shared_docs"; then
  echo "  - proposed changes: yes"
else
  echo "  - proposed changes: none detected"
fi
echo

echo "Decisions"
if [[ -f "$decisions" ]]; then
  accepted_count="$(awk -F '|' '
    /^## Accepted Decisions/ { in_section=1; next }
    /^## / && in_section { exit }
    in_section && /^\|/ && $2 !~ /---|Decision/ {
      value=$2 $3
      gsub(/^[ \t]+|[ \t]+$/, "", value)
      if (value != "") count++
    }
    END { print count + 0 }
  ' "$decisions")"
  deferred_count="$(awk -F '|' '
    /^## Deferred Decisions/ { in_section=1; next }
    /^## / && in_section { exit }
    in_section && /^\|/ && $2 !~ /---|Decision/ {
      value=$2 $3
      gsub(/^[ \t]+|[ \t]+$/, "", value)
      if (value != "") count++
    }
    END { print count + 0 }
  ' "$decisions")"
  echo "  - accepted decisions: ${accepted_count}"
  echo "  - deferred decisions: ${deferred_count}"
  echo "  - decision status: ${decision_status}"
else
  echo "  - decisions.md missing"
fi
echo

echo "Integration Sources"
if [[ "$workspace" == docs/workflows/*/integrate-* || "$workspace" == docs/workflows/*/*-integration ]]; then
  if [[ -f "$sources" ]]; then
    source_count="$(rg --no-filename -o 'docs/workflows/[^` )]+/' "$sources" | sort -u | wc -l | awk '{$1=$1; print}' || true)"
    base_count="$(awk -F '|' '
      /^\|/ && $2 ~ /feature\/|fix\/|docs\/|test\/|chore\/|hotfix\// {
        value=$4
        gsub(/^[ \t]+|[ \t]+$/, "", value)
        if (value != "" && value != "TBD" && value != "unavailable") count++
      }
      END { print count + 0 }
    ' "$sources")"
    echo "  - source workspace references: ${source_count}"
    echo "  - source base records: ${base_count}"
  else
    echo "  - sources.md missing"
  fi
else
  echo "  - not an integration workspace"
fi
echo

echo "PR Checklist Readiness"
missing_files=0
for required in "$plan" "$report" "$shared_docs" "$sources" "$confirmations" "$next_actions" "$sync_file" "$quality" "$decisions"; do
  [[ -f "$required" ]] || missing_files=$((missing_files + 1))
done

pending_count=0
if [[ -f "$confirmations" ]]; then
  pending_count="$(rg -c 'Status: pending' "$confirmations" || true)"
  pending_count="${pending_count:-0}"
fi

start_recorded="no"
if [[ -f "$sync_file" ]] && [[ -n "$(first_value "$sync_file" "- result:")" ]]; then
  start_recorded="yes"
fi

premerge_recorded="no"
if [[ -f "$sync_file" ]] && { [[ -n "$(section_value "$sync_file" "## Pre-Merge Sync" "- result:")" ]] || [[ -n "$(section_value "$sync_file" "## Pre-Merge Sync" "- deferral reason:")" ]]; }; then
  premerge_recorded="yes"
fi

linked_issue_recorded="n/a"
closing_keyword_recorded="n/a"
if [[ -f "$sync_file" ]]; then
  linked_issue_value="$(section_value "$sync_file" "## Push / PR" "- linked GitHub issue:")"
  closing_keyword_value="$(section_value "$sync_file" "## Push / PR" "- PR closing keyword:")"
  if [[ -n "$linked_issue_value" ]]; then
    linked_issue_recorded="yes"
    if [[ -n "$closing_keyword_value" ]]; then
      closing_keyword_recorded="yes"
    else
      closing_keyword_recorded="no"
    fi
  fi
fi

quality_ready="no"
if [[ "$quality_gate_status" != "missing" && "$quality_gate_status" != "draft" ]] && [[ -f "$quality" ]] && [[ "$(first_value "$quality" "- Applies:")" != "TBD" ]] && [[ "$(first_value "$quality" "- CI required:")" != "TBD" ]]; then
  quality_ready="yes"
fi

decisions_ready="no"
if [[ "$decision_status" != "missing" && "$decision_status" != "brief-needed" ]]; then
  decisions_ready="yes"
fi

pr_ready="no"
if [[ "$missing_files" -eq 0 && "$pending_count" -eq 0 && "$start_recorded" == "yes" && "$premerge_recorded" == "yes" && "$quality_ready" == "yes" && "$decisions_ready" == "yes" ]]; then
  pr_ready="yes"
fi

if [[ "$workspace_state" == "archived" ]]; then
  pr_ready="n/a (archived)"
fi

echo "  - missing required files: ${missing_files}"
echo "  - pending confirmations: ${pending_count}"
echo "  - start sync recorded: ${start_recorded}"
echo "  - pre-merge result/deferral recorded: ${premerge_recorded}"
echo "  - linked issue recorded: ${linked_issue_recorded}"
echo "  - PR closing keyword recorded: ${closing_keyword_recorded}"
echo "  - quality ready: ${quality_ready}"
echo "  - decisions ready: ${decisions_ready}"
echo "  - PR checklist ready: ${pr_ready}"
echo

recommendation="Run or update Quality Gate evidence before completion."

if [[ "$workspace_state" == "archived" ]]; then
  recommendation="Archived workspace; reopen or create a new branch before PR/integration work."
elif [[ "$missing_files" -gt 0 ]]; then
  recommendation="Restore missing required workspace files."
elif [[ -f "$confirmations" ]] && rg -q 'Status: pending' "$confirmations"; then
  recommendation="Resolve pending confirmation gates."
elif [[ "$decision_status" == "brief-needed" ]]; then
  recommendation="Create or resolve a Decision Option Brief and update decisions.md."
elif [[ "$quality_gate_status" == "draft" || "$tdd_applies" == "TBD" || "$ci_required" == "TBD" ]]; then
  recommendation="Ask for Quality Gate Confirm and update quality.md."
elif [[ ! -f "$sync_file" ]]; then
  recommendation="Create sync.md or rerun start-workflow.sh for this workspace."
elif [[ "$start_recorded" != "yes" ]]; then
  recommendation="Record Start Sync in sync.md."
elif [[ "$workspace_state" == "ready-for-review" || "$workspace_state" == "complete" || "$workspace_state" == "integration-ready" ]] && [[ "$premerge_recorded" != "yes" ]]; then
  recommendation="Ask for Pre-Merge Sync before completion or PR."
elif [[ "$closing_keyword_recorded" == "no" ]]; then
  recommendation="Record the PR closing keyword in sync.md so the linked issue closes after merge."
elif [[ "$decision_status" == "none" && -f "$shared_docs" ]] && awk -F '|' '
  /^\| `docs\// {
    value=$3 $4
    gsub(/^[ \t]+|[ \t]+$/, "", value)
    if (value != "") found=1
  }
  END { exit found ? 0 : 1 }
' "$shared_docs"; then
  recommendation="Review shared-doc proposals and decide whether decisions.md needs an accepted/deferred decision."
elif [[ "$workspace" == docs/workflows/*/integrate-* || "$workspace" == docs/workflows/*/*-integration ]]; then
  recommendation="Run scripts/validate-harness.sh --integration before integration completion."
elif [[ "${merge_status:-}" =~ ^merged ]] && [[ "${issue_close_status:-}" =~ ^CLOSED ]]; then
  recommendation="Phase is merged and linked issue is closed; choose the next phase or archive/cleanup follow-up."
elif [[ "$pr_ready" == "yes" ]]; then
  recommendation="완료 + PR 준비 상태입니다. 자동 PR 생성 대상입니다: scripts/prepare-pr.sh --auto-pr <workspace>로 push/PR 생성/PR 기록/CI 확인을 진행하세요. 이후 선택지: 1 PR 진행(merge, finalize, issue close 확인, automatic branch cleanup), 2 추가 보강, 3 다음 Phase, 4 보류, 5 외부 실행 승인(deploy/AWS 등 별도 승인)."
else
  recommendation="Prepare Completion Confirm or PR checklist."
fi

echo "Recommended Next Action"
echo "  - ${recommendation}"
