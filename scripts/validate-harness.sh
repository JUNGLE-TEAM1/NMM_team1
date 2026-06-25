#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/portable-tools.sh
source "${script_dir}/lib/portable-tools.sh"

failures=0
strict=0
integration=0

info() {
  echo "INFO: $*" >&2
}

field_value() {
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

workspace_state() {
  local dir="$1"
  local value
  value="$(field_value "${dir}/report.md" "- Workspace state:")"
  printf '%s\n' "${value:-draft}"
}

quality_status() {
  local dir="$1"
  local value
  value="$(field_value "${dir}/quality.md" "- Quality gate status:")"
  printf '%s\n' "${value:-draft}"
}

decision_status() {
  local dir="$1"
  local value
  value="$(field_value "${dir}/decisions.md" "- Decision status:")"
  printf '%s\n' "${value:-none}"
}

pre_merge_result() {
  local dir="$1"
  awk '
    /^## Pre-Merge Sync/ { in_pre=1; next }
    /^## / && in_pre { exit }
    in_pre && /^- result:/ {
      value=$0
      sub(/^- result:[ \t]*/, "", value)
      gsub(/^[ \t]+|[ \t]+$/, "", value)
      print value
      exit
    }
  ' "${dir}/sync.md"
}

pre_merge_deferral() {
  local dir="$1"
  awk '
    /^## Pre-Merge Sync/ { in_pre=1; next }
    /^## / && in_pre { exit }
    in_pre && /^- deferral reason:/ {
      value=$0
      sub(/^- deferral reason:[ \t]*/, "", value)
      gsub(/^[ \t]+|[ \t]+$/, "", value)
      print value
      exit
    }
  ' "${dir}/sync.md"
}

source_of_truth_files() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  awk -F '|' '
    /^## Proposed Source Of Truth Changes/ { in_section=1; next }
    /^## / && in_section { exit }
    in_section && /^\|/ && $2 !~ /---|File/ {
      value=$2
      gsub(/^[ \t]+|[ \t]+$/, "", value)
      gsub(/^`|`$/, "", value)
      if (value ~ /^docs\/[^ ]+\.md$/) print value
    }
  ' "$file" | sort -u
}

changed_since_base() {
  local base="$1"
  local file="$2"
  [[ -n "$base" && "$base" != "TBD" && "$base" != "unavailable" ]] || return 1
  git rev-parse --verify --quiet "$base^{commit}" >/dev/null 2>&1 || return 1
  if git diff --name-only "${base}..HEAD" -- "$file" | rg -q "^${file}$"; then
    return 0
  fi
  if git diff --cached --name-only -- "$file" | rg -q "^${file}$"; then
    return 0
  fi
  git diff --name-only -- "$file" | rg -q "^${file}$"
}

has_source_of_truth_deferred_decision() {
  local file="$1"
  [[ -f "$file" ]] || return 1
  awk -F '|' '
    /^## Deferred Decisions/ { in_section=1; next }
    /^## / && in_section { exit }
    in_section && /^\|/ && $2 !~ /---|Decision/ {
      reason=$3
      revisit=$4
      target=$5
      gsub(/^[ \t]+|[ \t]+$/, "", reason)
      gsub(/^[ \t]+|[ \t]+$/, "", revisit)
      gsub(/^[ \t]+|[ \t]+$/, "", target)
      if (reason != "" && reason != "TBD" && revisit != "" && revisit != "TBD" && target != "" && target != "TBD") found=1
    }
    END { exit found ? 0 : 1 }
  ' "$file"
}

validate_source_of_truth_impact() {
  local dir="$1"
  local state="$2"
  local shared_file="${dir}/shared-docs.md"
  local decisions_file="${dir}/decisions.md"
  local sync_file="${dir}/sync.md"
  local base
  local proposed_file
  local proposal_count=0
  local unresolved=0

  proposal_count="$(source_of_truth_files "$shared_file" | wc -l | awk '{$1=$1; print}')"

  if [[ "$proposal_count" -eq 0 ]]; then
    return 0
  fi

  base="$(field_value "$sync_file" "- base commit:")"

  while IFS= read -r proposed_file; do
    [[ -n "$proposed_file" ]] || continue
    if changed_since_base "$base" "$proposed_file"; then
      continue
    fi
    if has_source_of_truth_deferred_decision "$decisions_file"; then
      continue
    fi
    unresolved=$((unresolved + 1))
    fail "Unresolved Source of Truth proposal '${proposed_file}' in ${shared_file}; update the file or record a deferred decision with revisit trigger and target branch/phase."
  done < <(source_of_truth_files "$shared_file")
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

emptyish() {
  case "$1" in
    ""|none|None|NONE|n/a|N/A|"not requested") return 0 ;;
    *) return 1 ;;
  esac
}

validate_sync_handoff() {
  local dir="$1"
  local sync_file="${dir}/sync.md"
  local linked_issue
  local closing_keyword
  local pushed_branch
  local pr_link
  local merge_status
  local issue_close_status

  linked_issue="$(section_value "$sync_file" "## Push / PR" "- linked GitHub issue:")"
  closing_keyword="$(section_value "$sync_file" "## Push / PR" "- PR closing keyword:")"
  pushed_branch="$(section_value "$sync_file" "## Push / PR" "- pushed branch:")"
  pr_link="$(section_value "$sync_file" "## Push / PR" "- PR link:")"
  merge_status="$(section_value "$sync_file" "## Push / PR" "- merge status:")"
  issue_close_status="$(section_value "$sync_file" "## Push / PR" "- issue close status:")"
  for field_name in linked_issue closing_keyword pushed_branch pr_link merge_status issue_close_status; do
    if emptyish "${!field_name}"; then
      printf -v "$field_name" '%s' ""
    fi
  done

  if [[ -n "$linked_issue" && -z "$closing_keyword" ]]; then
    fail "sync.md linked issue exists but PR closing keyword is missing: ${sync_file}"
  fi

  if [[ -n "$linked_issue" && "$linked_issue" =~ ^#([0-9]+)$ && "$closing_keyword" != *"#${BASH_REMATCH[1]}"* ]]; then
    fail "sync.md PR closing keyword does not reference linked issue ${linked_issue}: ${sync_file}"
  fi

  if [[ -n "$pr_link" && -z "$pushed_branch" ]]; then
    fail "sync.md PR link exists but pushed branch is missing: ${sync_file}"
  fi

  if [[ -z "$pr_link" ]]; then
    case "$merge_status" in
      ""|"not created yet") ;;
      *) fail "sync.md merge status is set before PR link exists: ${sync_file}" ;;
    esac
    case "$issue_close_status" in
      ""|"not created yet") ;;
      *) fail "sync.md issue close status is set before PR link exists: ${sync_file}" ;;
    esac
  fi

  if [[ "$merge_status" == open && "$issue_close_status" =~ ^CLOSED ]]; then
    fail "sync.md issue is closed while merge status is still open: ${sync_file}"
  fi

  if [[ "$merge_status" =~ ^merged && "$issue_close_status" == open ]]; then
    fail "sync.md PR is merged but issue close status is still open: ${sync_file}"
  fi
}

is_ready_state() {
  case "$1" in
    ready-for-review|complete|integration-ready) return 0 ;;
    *) return 1 ;;
  esac
}

is_active_state() {
  case "$1" in
    draft|in-progress) return 0 ;;
    *) return 1 ;;
  esac
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --strict)
      strict=1
      shift
      ;;
    --integration)
      strict=1
      integration=1
      shift
      ;;
    -h|--help)
      cat <<'USAGE'
Usage:
  scripts/validate-harness.sh [--strict] [--integration]

Default validation checks required harness files and references.
Strict validation also checks completion-sensitive workspace quality:
- no pending human confirmations
- non-empty shared document proposals when shared-docs.md exists
- unresolved Source of Truth proposals are applied or deferred
- integration workspaces declare source branches
- integration workspaces record source branch base information
- sync.md records a base commit or explicit result
- quality.md records TDD/CI gate status
- decisions.md records high-impact decision status
Integration validation also checks source branch handoff completeness.
USAGE
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

fail() {
  echo "FAIL: $*" >&2
  failures=$((failures + 1))
}

require_file() {
  local file="$1"
  [[ -f "$file" ]] || fail "Missing file: ${file}"
}

require_pattern() {
  local file="$1"
  local pattern="$2"
  local description="$3"
  if ! rg -q "$pattern" "$file"; then
    fail "${description}: ${file}"
  fi
}

require_file "AGENTS.md"
require_file "docs/00-layer-map.md"
require_file "docs/08-development-workflow.md"
require_file "docs/09-collaboration-agreement.md"
require_file "docs/10-next-action-menu.md"
require_file "docs/11-git-sync-policy.md"
require_file "docs/12-quality-gates.md"
require_file "docs/13-human-command-flow.md"
require_file "docs/14-decision-option-brief.md"
require_file "docs/15-context-budget-rule.md"
require_file "docs/16-existing-codebase-adoption.md"
require_file "docs/18-harness-regression-policy.md"
require_file "docs/workflows/README.md"
require_file "docs/reports/README.md"
require_file ".github/pull_request_template.md"
require_file ".github/workflows/harness-validation.example.yml"
require_file "scripts/start-workflow.sh"
require_file "scripts/status-workflow.sh"
require_file "scripts/harness-flow-check.sh"
require_file "scripts/list-active-branches.sh"
require_file "scripts/test-harness.sh"
require_file "scripts/lib/portable-tools.sh"
require_file "scripts/lib/portable_rg.py"

while IFS= read -r -d '' dir; do
  require_file "${dir}/plan.md"
  require_file "${dir}/notes.md"
  require_file "${dir}/report.md"
  require_file "${dir}/quality.md"
  require_file "${dir}/decisions.md"
  require_file "${dir}/shared-docs.md"
  require_file "${dir}/sources.md"
  require_file "${dir}/confirmations.md"
  require_file "${dir}/next-actions.md"
  require_file "${dir}/sync.md"

  if ! rg -q "decisions.md" "${dir}/sources.md"; then
    fail "Workspace sources.md does not mention decisions.md handoff: ${dir}/sources.md"
  fi

  if rg -q '^### Step ' "${dir}/plan.md"; then
    for heading in "#### 구현 프롬프트" "#### 검증 프롬프트" "#### 완료 기준"; do
      if ! rg -q "^${heading}$" "${dir}/plan.md"; then
        fail "Workspace plan.md has Step sections but is missing ${heading}: ${dir}/plan.md"
      fi
    done
  fi

  if [[ "$strict" -eq 1 ]]; then
    state="$(workspace_state "$dir")"
    q_status="$(quality_status "$dir")"
    d_status="$(decision_status "$dir")"

    case "$state" in
      draft|in-progress|ready-for-review|complete|integration-ready|archived) ;;
      *) fail "Invalid Workspace state '${state}' in ${dir}/report.md" ;;
    esac

    case "$q_status" in
      draft|planned|passed|passed-with-skips|deferred) ;;
      *) fail "Invalid Quality gate status '${q_status}' in ${dir}/quality.md" ;;
    esac

    case "$d_status" in
      none|brief-needed|accepted|deferred|mixed) ;;
      *) fail "Invalid Decision status '${d_status}' in ${dir}/decisions.md" ;;
    esac

    if is_active_state "$state"; then
      info "Skipping completion-only semantic checks for ${dir} because Workspace state is ${state}"
    fi

    if ! rg -q "Context Budget mode:" "${dir}/report.md"; then
      if is_ready_state "$state"; then
        fail "Context Budget mode is missing in ready workspace ${dir}/report.md"
      else
        info "Context Budget mode is missing in ${dir}/report.md"
      fi
    fi

    if [[ "$state" != "draft" && "$state" != "in-progress" && "$state" != "archived" ]] && rg -q 'Status: pending' "${dir}/confirmations.md"; then
      fail "Pending human confirmation remains in ${dir}/confirmations.md"
    fi

    if is_ready_state "$state" && ! awk -F '|' '
      /^\| `docs\// {
        gsub(/^[ \t]+|[ \t]+$/, "", $3)
        gsub(/^[ \t]+|[ \t]+$/, "", $4)
        if ($3 != "" || $4 != "") found=1
      }
      END { exit found ? 0 : 1 }
    ' "${dir}/shared-docs.md"; then
      fail "No filled shared document proposal found in ${dir}/shared-docs.md"
    fi

    case "$dir" in
      docs/workflows/*/integrate-*|docs/workflows/*/*-integration)
        if ! rg -q 'docs/workflows/[^/]+/[^/]+/' "${dir}/sources.md"; then
          fail "Integration workspace lacks source branch references in ${dir}/sources.md"
        fi
        if ! awk -F '|' '
          /^\|/ && $2 ~ /feature\/|fix\/|docs\/|test\/|chore\/|hotfix\// {
            value=$4
            gsub(/^[ \t]+|[ \t]+$/, "", value)
            if (value != "" && value != "TBD" && value != "unavailable") found=1
          }
          END { exit found ? 0 : 1 }
        ' "${dir}/sources.md"; then
          fail "Integration workspace lacks source branch base commit records in ${dir}/sources.md"
        fi
        ;;
    esac

    if ! awk '
      /^## Recommended Next Action/ { in_section=1; next }
      /^## / && in_section { exit found ? 0 : 1 }
      in_section && /^- / {
        line=$0
        sub(/^- /, "", line)
        gsub(/^[ \t]+|[ \t]+$/, "", line)
        if (line != "" && line != "TBD") found=1
      }
      END {
        if (in_section) exit found ? 0 : 1
      }
    ' "${dir}/next-actions.md"; then
      fail "Recommended Next Action is missing in ${dir}/next-actions.md"
    fi

    if is_ready_state "$state" && rg -q "workspace created|scope는 아직|Scope Confirm을 요청" "${dir}/next-actions.md"; then
      fail "Ready workspace has stale starter next-actions text: ${dir}/next-actions.md"
    fi

    if ! awk -F ':' '
      /^- base commit:/ {
        value=$0
        sub(/^- base commit:[ \t]*/, "", value)
        gsub(/^[ \t]+|[ \t]+$/, "", value)
        if (value != "" && value != "unavailable" && value != "TBD") found=1
      }
      /^- result:/ {
        value=$0
        sub(/^- result:[ \t]*/, "", value)
        gsub(/^[ \t]+|[ \t]+$/, "", value)
        if (value != "" && value != "TBD") found=1
      }
      END { exit found ? 0 : 1 }
    ' "${dir}/sync.md"; then
      fail "Sync base commit or result is missing in ${dir}/sync.md"
    fi

    if ! rg -q "TDD Plan" "${dir}/quality.md" || ! rg -q "CI/CD Gate" "${dir}/quality.md"; then
      fail "Quality gate sections are missing in ${dir}/quality.md"
    fi

    if ! rg -q "Decision Option Briefs" "${dir}/decisions.md" || ! rg -q "Accepted Decisions" "${dir}/decisions.md" || ! rg -q "Deferred Decisions" "${dir}/decisions.md" || ! rg -q "Revisit / Rollback Conditions" "${dir}/decisions.md"; then
      fail "Decision sections are missing in ${dir}/decisions.md"
    fi

    if is_ready_state "$state"; then
      validate_sync_handoff "$dir"
      validate_source_of_truth_impact "$dir" "$state"

      if [[ "$q_status" == "draft" ]]; then
        fail "Quality gate status is still draft in ready workspace ${dir}/quality.md"
      fi
      if [[ "$(field_value "${dir}/quality.md" "- Applies:")" == "TBD" ]]; then
        fail "TDD applies is still TBD in ready workspace ${dir}/quality.md"
      fi
      if [[ "$(field_value "${dir}/quality.md" "- CI required:")" == "TBD" ]]; then
        fail "CI required is still TBD in ready workspace ${dir}/quality.md"
      fi
      if [[ -z "$(pre_merge_result "$dir")" && -z "$(pre_merge_deferral "$dir")" ]]; then
        fail "Pre-Merge Sync result or deferral reason is missing in ready workspace ${dir}/sync.md"
      fi
      if [[ "$d_status" == "brief-needed" ]]; then
        fail "Decision status is brief-needed in ready workspace ${dir}/decisions.md"
      fi
      if [[ "$d_status" == "none" ]] && awk -F '|' '
        /^\| `docs\// {
          value=$3 $4
          gsub(/^[ \t]+|[ \t]+$/, "", value)
          if (value != "") found=1
        }
        END { exit found ? 0 : 1 }
      ' "${dir}/shared-docs.md"; then
        fail "Shared Source of Truth proposals exist but Decision status is none in ready workspace ${dir}/decisions.md"
      fi
    fi
  fi
done < <(find docs/workflows -mindepth 2 -maxdepth 2 -type d -print0)

if [[ "$integration" -eq 1 ]]; then
  integration_found=0
  while IFS= read -r -d '' dir; do
    case "$dir" in
      docs/workflows/*/integrate-*|docs/workflows/*/*-integration) ;;
      *) continue ;;
    esac

    integration_found=1
    integration_state="$(workspace_state "$dir")"

    if ! rg -q 'docs/workflows/[^/]+/[^/]+/' "${dir}/sources.md"; then
      fail "Integration workspace lacks source branch workspace references in ${dir}/sources.md"
      continue
    fi

    if ! awk -F '|' '
      /^\|/ && $2 ~ /feature\/|fix\/|docs\/|test\/|chore\/|hotfix\// {
        value=$4
        gsub(/^[ \t]+|[ \t]+$/, "", value)
        if (value != "" && value != "TBD" && value != "unavailable") found=1
      }
      END { exit found ? 0 : 1 }
    ' "${dir}/sources.md"; then
      fail "Integration workspace lacks source branch/base commit records in ${dir}/sources.md"
    fi

    while IFS= read -r source_dir; do
      source_dir="${source_dir%/}"
      require_file "${source_dir}/plan.md"
      require_file "${source_dir}/report.md"
      require_file "${source_dir}/shared-docs.md"
      require_file "${source_dir}/quality.md"
      require_file "${source_dir}/decisions.md"
      require_file "${source_dir}/confirmations.md"
      require_file "${source_dir}/sync.md"

      if [[ -f "${source_dir}/confirmations.md" ]] && rg -q 'Status: pending' "${source_dir}/confirmations.md"; then
        fail "Source branch has pending confirmation: ${source_dir}/confirmations.md"
      fi

      if [[ -f "${source_dir}/quality.md" ]] && { ! rg -q "TDD Plan" "${source_dir}/quality.md" || ! rg -q "CI/CD Gate" "${source_dir}/quality.md"; }; then
        fail "Source branch quality gates are incomplete: ${source_dir}/quality.md"
      fi

      if [[ -f "${source_dir}/sync.md" ]] && ! awk -F ':' '
        /^- base commit:/ {
          value=$0
          sub(/^- base commit:[ \t]*/, "", value)
          gsub(/^[ \t]+|[ \t]+$/, "", value)
          if (value != "" && value != "unavailable" && value != "TBD") found=1
        }
        /^- result:/ {
          value=$0
          sub(/^- result:[ \t]*/, "", value)
          gsub(/^[ \t]+|[ \t]+$/, "", value)
          if (value != "" && value != "TBD") found=1
        }
        END { exit found ? 0 : 1 }
      ' "${source_dir}/sync.md"; then
        fail "Source branch sync base/result is missing: ${source_dir}/sync.md"
      fi

      if is_ready_state "$integration_state"; then
        source_state="$(workspace_state "$source_dir")"
        source_quality_status="$(quality_status "$source_dir")"
        source_decision_status="$(decision_status "$source_dir")"

        case "$source_state" in
          complete|integration-ready|archived) ;;
          *) fail "Integration-ready workspace depends on non-ready source state '${source_state}': ${source_dir}/report.md" ;;
        esac

        case "$source_quality_status" in
          passed|passed-with-skips|deferred) ;;
          *) fail "Integration-ready workspace depends on incomplete source quality status '${source_quality_status}': ${source_dir}/quality.md" ;;
        esac

        if [[ "$source_decision_status" == "brief-needed" ]]; then
          fail "Integration-ready workspace depends on source decision status brief-needed: ${source_dir}/decisions.md"
        fi

        if [[ -z "$(pre_merge_result "$source_dir")" && -z "$(pre_merge_deferral "$source_dir")" ]]; then
          fail "Integration-ready workspace depends on source without Pre-Merge result or deferral: ${source_dir}/sync.md"
        fi
      fi
    done < <(rg --no-filename -o 'docs/workflows/[^` )]+/' "${dir}/sources.md" | sort -u || true)

    if ! awk -F '|' '
      /^\| `docs\// {
        value=$3 $4
        gsub(/^[ \t]+|[ \t]+$/, "", value)
        if (value != "") found=1
      }
      END { exit found ? 0 : 1 }
    ' "${dir}/shared-docs.md"; then
      fail "Integration shared-docs lacks reconciliation decisions in ${dir}/shared-docs.md"
    fi
  done < <(find docs/workflows -mindepth 2 -maxdepth 2 -type d -print0)

  if [[ "$integration_found" -eq 0 ]]; then
    fail "No integration workspace found for --integration validation"
  fi
fi

if ! rg -q "Integration Branch Rule" docs/08-development-workflow.md; then
  fail "docs/08-development-workflow.md does not mention Integration Branch Rule"
fi

if ! rg -q "check-pr-sync" docs/08-development-workflow.md || ! rg -q "finalize" docs/08-development-workflow.md; then
  fail "docs/08-development-workflow.md does not mention PR sync preflight/finalization gates"
fi

if ! rg -q "재발 방지 하네스 규칙" docs/08-development-workflow.md; then
  fail "docs/08-development-workflow.md does not mention recurrence-prevention harness rules"
fi

if ! rg -q "Integration Agreement" docs/09-collaboration-agreement.md; then
  fail "docs/09-collaboration-agreement.md does not mention Integration Agreement"
fi

if ! rg -q "shared-docs.md" docs/workflows/README.md; then
  fail "docs/workflows/README.md does not mention shared-docs.md"
fi

if ! rg -q "Human Confirmation Gates" docs/09-collaboration-agreement.md; then
  fail "docs/09-collaboration-agreement.md does not mention Human Confirmation Gates"
fi

if ! rg -q "Next Action Menu" docs/10-next-action-menu.md; then
  fail "docs/10-next-action-menu.md does not mention Next Action Menu"
fi

if ! rg -q "Git Sync Policy" docs/11-git-sync-policy.md; then
  fail "docs/11-git-sync-policy.md does not mention Git Sync Policy"
fi

if ! rg -q "harness-flow-check.sh" docs/11-git-sync-policy.md; then
  fail "docs/11-git-sync-policy.md does not mention harness-flow-check.sh"
fi

if ! rg -q "Harness Test Update Gate" docs/08-development-workflow.md docs/12-quality-gates.md docs/13-human-command-flow.md docs/workflows/README.md docs/18-harness-regression-policy.md; then
  fail "Harness Test Update Gate is not documented across workflow, quality, human command flow, and workspace docs"
fi

if ! rg -q "Harness Regression Policy|docs/18-harness-regression-policy.md" docs/00-layer-map.md docs/12-quality-gates.md docs/workflows/README.md; then
  fail "Harness Regression Policy Source of Truth is not registered and referenced"
fi

if ! rg -q "fetch-depth: 0" docs/18-harness-regression-policy.md .github/workflows/ci.yml; then
  fail "Harness regression policy and CI must mention fetch-depth: 0"
fi

if ! rg -q "scripts/test-harness.sh" docs/08-development-workflow.md docs/12-quality-gates.md docs/workflows/README.md docs/18-harness-regression-policy.md .github/workflows/ci.yml; then
  fail "Harness regression test script is not documented and wired into CI"
fi

if ! rg -q "Quality Gates" docs/12-quality-gates.md; then
  fail "docs/12-quality-gates.md does not mention Quality Gates"
fi

if ! rg -q "Human Command Flow" docs/13-human-command-flow.md; then
  fail "docs/13-human-command-flow.md does not mention Human Command Flow"
fi

if ! rg -q "재발 방지" docs/13-human-command-flow.md; then
  fail "docs/13-human-command-flow.md does not mention recurrence-prevention flow"
fi

for section in \
  "Start A New Feature" \
  "Confirm Before Implementation" \
  "Handle Main Changes During Work" \
  "Verify Work" \
  "Integrate Feature Branches" \
  "Prepare PR" \
  "Recompare A Decision" \
  "Ask For Current Status" \
  "Ask For CI Example"; do
  if ! rg -q "$section" docs/13-human-command-flow.md; then
    fail "docs/13-human-command-flow.md is missing command-flow section: ${section}"
  fi
done

if ! rg -q "Decision Option Brief" docs/14-decision-option-brief.md; then
  fail "docs/14-decision-option-brief.md does not mention Decision Option Brief"
fi

if ! rg -q "Context Budget Rule" docs/15-context-budget-rule.md; then
  fail "docs/15-context-budget-rule.md does not mention Context Budget Rule"
fi

for keyword in "Lite Read" "Escalate Read" "Audit Read"; do
  if ! rg -q "$keyword" docs/15-context-budget-rule.md; then
    fail "docs/15-context-budget-rule.md does not mention ${keyword}"
  fi
done

for file in \
  AGENTS.md \
  docs/00-layer-map.md \
  docs/08-development-workflow.md \
  docs/09-collaboration-agreement.md \
  docs/10-next-action-menu.md \
  docs/13-human-command-flow.md \
  docs/workflows/README.md; do
  if ! rg -q "Context Budget|Lite Read|Escalate Read|Audit Read" "$file"; then
    fail "${file} does not mention Context Budget Rule or read modes"
  fi
done

if ! rg -q "Context Budget Evidence" docs/reports/_template.md; then
  fail "docs/reports/_template.md does not include Context Budget Evidence"
fi

if ! rg -q "Existing Codebase Adoption" docs/16-existing-codebase-adoption.md; then
  fail "docs/16-existing-codebase-adoption.md does not mention Existing Codebase Adoption"
fi

if ! rg -q "docs/16-existing-codebase-adoption.md" docs/00-layer-map.md; then
  fail "docs/00-layer-map.md does not reference docs/16-existing-codebase-adoption.md"
fi

if ! rg -q "docs/16-existing-codebase-adoption.md" docs/08-development-workflow.md; then
  fail "docs/08-development-workflow.md does not reference docs/16-existing-codebase-adoption.md"
fi

if ! rg -q "Phase N - \\[PHASE_NAME\\]" docs/08-development-workflow.md; then
  fail "docs/08-development-workflow.md is missing the Phase 작성 형식 template"
fi

if ! rg -q -- "--no-issue" docs/08-development-workflow.md; then
  fail "docs/08-development-workflow.md must document --no-issue as the explicit exception to default issue creation"
fi

if ! rg -q "Branch workspace issue creation remains the team default" docs/13-human-command-flow.md; then
  fail "docs/13-human-command-flow.md must distinguish PR preparation from default branch issue creation"
fi

if ! rg -q "Branch Switch Confirm|Branch switch confirmation|브랜치 전환" docs/08-development-workflow.md docs/11-git-sync-policy.md docs/13-human-command-flow.md; then
  fail "Branch switch confirmation is not documented across workflow, sync policy, and human command flow"
fi

if ! rg -q "Remaining Branch Queue|남은 작업 브랜치|list-active-branches.sh" docs/08-development-workflow.md docs/11-git-sync-policy.md docs/13-human-command-flow.md docs/10-next-action-menu.md; then
  fail "Remaining branch queue flow is not documented across workflow docs"
fi

if ! rg -q "automatic merged branch cleanup|자동 merged branch cleanup|cleanup-merged-branches.sh" docs/08-development-workflow.md docs/10-next-action-menu.md docs/11-git-sync-policy.md docs/13-human-command-flow.md scripts/prepare-pr.sh; then
  fail "Automatic merged branch cleanup is not documented across workflow docs and prepare-pr"
fi

if ! rg -q "Pre-PR Human Checkpoint" AGENTS.md docs/08-development-workflow.md docs/10-next-action-menu.md docs/11-git-sync-policy.md docs/12-quality-gates.md docs/13-human-command-flow.md docs/09-collaboration-agreement.md docs/workflows/README.md scripts/status-workflow.sh; then
  fail "Pre-PR Human Checkpoint policy is not documented across workflow docs and status workflow"
fi

if ! rg -q "PR Conflict Resolution Protocol" docs/11-git-sync-policy.md; then
  fail "docs/11-git-sync-policy.md must document PR Conflict Resolution Protocol"
fi

if ! rg -q "PR Conflict Detected" docs/10-next-action-menu.md; then
  fail "docs/10-next-action-menu.md must include PR Conflict Detected menu"
fi

if ! rg -q "PR 충돌 해결해|PR conflict" docs/13-human-command-flow.md; then
  fail "docs/13-human-command-flow.md must document a PR conflict command flow"
fi

if ! rg -q "PR Conflict Confirm" scripts/start-workflow.sh || ! rg -q "PR Conflict Resolution" scripts/start-workflow.sh; then
  fail "scripts/start-workflow.sh must template PR Conflict Confirm and PR Conflict Resolution evidence"
fi

if ! rg -q "PR Conflict" scripts/status-workflow.sh || ! rg -q "pr_conflict_" scripts/status-workflow.sh; then
  fail "scripts/status-workflow.sh must summarize PR conflict evidence read-only"
fi

if ! rg -q "PR 올리지 마|로컬에만 둬|PR은 나중에|draft만" docs/08-development-workflow.md docs/11-git-sync-policy.md docs/13-human-command-flow.md; then
  fail "PR hold/opt-out phrases are not documented"
fi

if ! rg -q "자동 PR 생성|auto-create the PR|Auto PR Creation" docs/08-development-workflow.md docs/10-next-action-menu.md docs/11-git-sync-policy.md docs/13-human-command-flow.md scripts/status-workflow.sh; then
  fail "Automatic PR creation policy must be documented across workflow docs and status workflow"
fi

if ! rg -q -- "--auto-pr" scripts/prepare-pr.sh || ! rg -q "approved_pr=1" scripts/prepare-pr.sh; then
  fail "scripts/prepare-pr.sh must provide --auto-pr for automatic PR creation"
fi

if ! rg -q "compatibility alias for --auto-pr|과거 호환용 alias" scripts/prepare-pr.sh docs/11-git-sync-policy.md; then
  fail "Compatibility behavior for --approved-pr must be documented"
fi

if ! rg -q "cleanup-merged-branches.sh" scripts/prepare-pr.sh || ! rg -q "scripts/cleanup-merged-branches.sh" docs/11-git-sync-policy.md; then
  fail "prepare-pr finalize must run scripts/cleanup-merged-branches.sh and policy must document it"
fi

if ! rg -q "allowed workspace branch 원격 조회.*git push origin --delete.*git branch -d.*git fetch --prune" docs/11-git-sync-policy.md; then
  fail "Automatic cleanup local/remote/prune command order is not documented"
fi

if ! rg -q "git branch -D.*자동 실행하지 않는다|git branch -D.*without separate human confirmation" docs/11-git-sync-policy.md docs/13-human-command-flow.md; then
  fail "Automatic cleanup must document that git branch -D is not automatic"
fi

if ! rg -q "AWS resource|cloud resource|external resources|별도 명시 승인" docs/08-development-workflow.md docs/11-git-sync-policy.md docs/13-human-command-flow.md; then
  fail "Automatic cleanup must exclude AWS/cloud/external resource cleanup"
fi

if ! rg -q "Remote Workspace Branches|workspace_branch_regex|Remote \\| Tracking" scripts/list-active-branches.sh; then
  fail "scripts/list-active-branches.sh must show local/remote/tracking branch cleanup context"
fi

require_file "scripts/cleanup-merged-branches.sh"

if ! rg -q "완료 후 handoff 선택지|completion handoff choice menu" docs/08-development-workflow.md docs/13-human-command-flow.md; then
  fail "Completion handoff choice menu is not documented in workflow and human command flow"
fi

if ! rg -q "진행 절차|장점|주의사항" docs/08-development-workflow.md; then
  fail "docs/08-development-workflow.md must explain completion handoff choice procedure, advantages, and cautions"
fi

if ! rg -q "PR만.*PR creation|merge.*finalize" docs/13-human-command-flow.md; then
  fail "docs/13-human-command-flow.md must distinguish PR-only from merge/finalize flow"
fi

if ! rg -q "Complete And PR Ready|추가 보강|다음 Phase|보류|외부 실행 승인" docs/10-next-action-menu.md; then
  fail "docs/10-next-action-menu.md must include complete PR-ready choice details"
fi

if ! rg -q "완료 \\+ PR 준비 상태입니다.*자동 PR 생성 대상입니다.*--auto-pr.*Pre-PR Human Checkpoint.*1 PR 진행.*2 PR 보류.*3 추가 보강.*4 다음 Phase.*5 외부 실행 승인" scripts/status-workflow.sh; then
  fail "scripts/status-workflow.sh must recommend automatic PR creation followed by Pre-PR Human Checkpoint choices for complete PR-ready workspaces"
fi

if ! rg -q "PR이 이미 열려 있습니다.*1 PR 진행\\(merge, finalize, issue close 확인, automatic branch cleanup\\).*2 추가 보강.*3 보류.*4 다음 Phase" scripts/status-workflow.sh; then
  fail "scripts/status-workflow.sh must recommend existing PR choices before merge/finalize"
fi

for file in \
  README.md \
  docs/01-product-planning.md \
  docs/02-architecture.md \
  docs/03-interface-reference.md \
  docs/05-acceptance-scenarios-and-checklist.md \
  docs/06-regression-and-failure-scenarios.md \
  docs/07-manual-verification-playbook.md \
  docs/08-development-workflow.md; do
  require_pattern "$file" "Current implementation baseline|Current Baseline|current baseline|현재 구현 baseline" "Product context guard requires current baseline separation"
  require_pattern "$file" "Target MVP" "Product context guard requires Target MVP context"
done

for file in \
  README.md \
  docs/01-product-planning.md \
  docs/05-acceptance-scenarios-and-checklist.md \
  docs/08-development-workflow.md; do
  require_pattern "$file" "Trusted Dataset -> Query/Ask -> Evidence -> Recovery" "Product context guard requires the Target MVP trust loop"
done

if ! rg -q "Current Baseline이 제품 목표처럼 남는 경우" docs/06-regression-and-failure-scenarios.md; then
  fail "docs/06-regression-and-failure-scenarios.md must guard against current baseline becoming the product goal"
fi

if ! rg -q "Trust Gate 없이 Query/Ask가 진행되는 경우" docs/06-regression-and-failure-scenarios.md; then
  fail "docs/06-regression-and-failure-scenarios.md must guard against Query/Ask before Trust Gate"
fi

if ! rg -q "feature/trust-state-model" docs/08-development-workflow.md; then
  fail "docs/08-development-workflow.md must keep the next Target MVP implementation phase anchored on feature/trust-state-model"
fi

if ! rg -q "Existing Codebase Adoption|baseline \\+ next-change|docs/16-existing-codebase-adoption.md" README.md; then
  fail "README.md must mention Existing Codebase Adoption or baseline + next-change"
fi

if ! rg -q "Bounded Audit Read" docs/15-context-budget-rule.md || ! rg -q "Existing Codebase Adoption" docs/15-context-budget-rule.md; then
  fail "docs/15-context-budget-rule.md must mention Bounded Audit Read for Existing Codebase Adoption"
fi

if ! rg -q "Baseline Codebase Adoption" docs/reports/_template.md; then
  fail "docs/reports/_template.md does not include Baseline Codebase Adoption"
fi

if ! rg -q "Infrastructure / Operations Gap Assessment" docs/16-existing-codebase-adoption.md; then
  fail "docs/16-existing-codebase-adoption.md does not include Infrastructure / Operations Gap Assessment"
fi

if ! rg -q "Gap To Next Phase Promotion" docs/16-existing-codebase-adoption.md; then
  fail "docs/16-existing-codebase-adoption.md does not include Gap To Next Phase Promotion"
fi

if ! rg -q "Infrastructure gaps" docs/reports/_template.md || ! rg -q "Next Phase candidates" docs/reports/_template.md; then
  fail "docs/reports/_template.md does not include infrastructure gap and next phase candidate fields"
fi

if ! rg -q "Infrastructure Gap Detected" docs/10-next-action-menu.md; then
  fail "docs/10-next-action-menu.md does not include Infrastructure Gap Detected"
fi

if ! rg -q "validate-harness.sh --integration" .github/pull_request_template.md; then
  fail ".github/pull_request_template.md does not mention integration validation"
fi

if ! rg -q "decisions.md" .github/pull_request_template.md; then
  fail ".github/pull_request_template.md does not mention decisions.md"
fi

if ! rg -q "## 목표|## 범위|## 구현 프롬프트|## 검증 프롬프트|## 완료 기준" scripts/start-workflow.sh; then
  fail "scripts/start-workflow.sh does not generate Korean-centered workspace templates"
fi

if ! rg -q "## 1\\. 이슈 요약|## 5\\. 관련 문서 / Source of Truth|## 6\\. Acceptance Criteria|## 7\\. Regression / Failure Scenario|## 8\\. Manual Verification" scripts/start-workflow.sh; then
  fail "scripts/start-workflow.sh does not generate Korean-centered GitHub issue bodies"
fi

if ! rg -q "prefixed_issue_title|issue_labels_for_type|--body-file" scripts/start-workflow.sh; then
  fail "scripts/start-workflow.sh does not use Korean issue title prefixes, labels, and body files"
fi

if rg -q "## AskLake branch workspace|^## Scope$|--body[ =]" scripts/start-workflow.sh; then
  fail "scripts/start-workflow.sh still contains stale English issue body headings or unsafe inline issue body usage"
fi

if ! rg -q "FAKE_GH_BODY_LOG|연결된 Issue: 연결된 issue 없음|이슈 요약" scripts/test-harness.sh; then
  fail "scripts/test-harness.sh does not guard generated issue/PR template bodies"
fi

if ! rg -q "내부 단계별 프롬프트" docs/08-development-workflow.md; then
  fail "docs/08-development-workflow.md does not document internal step prompts"
fi

if ! rg -q "## 내부 단계별 프롬프트" scripts/start-workflow.sh; then
  fail "scripts/start-workflow.sh does not generate an internal step prompt section"
fi

if ! rg -q "짧은 보고|검증 명령|수동 검증|최종 판단" docs/reports/_template.md; then
  fail "docs/reports/_template.md is not Korean-centered"
fi

if ! rg -q "PR 요약|변경 내용|검증|영향 범위|리뷰어에게 부탁할 부분|남은 일 / 제외한 일|Merge 전 확인" .github/pull_request_template.md; then
  fail ".github/pull_request_template.md is not Korean-centered"
fi

if ! rg -q "changed_summary|verified_summary|remaining_summary|risk_summary|## 2\\. 변경 내용|## 5\\. 리뷰어에게 부탁할 부분|## 6\\. 남은 일 / 제외한 일" scripts/prepare-pr.sh scripts/test-harness.sh; then
  fail "prepare-pr PR body does not surface readable reviewer context from workspace reports"
fi

if ! rg -q "목적|절차|기대 결과|실패 시|증거" docs/manual-verification/01-golden-path.md; then
  fail "manual verification documents are not Korean-centered"
fi

while IFS= read -r report; do
  [[ -f "docs/reports/${report}" ]] || fail "Report index points to missing file: docs/reports/${report}"
done < <(rg --no-filename -o '`phase-[^`]+\.md`' docs/reports/README.md | tr -d '`' || true)

while IFS= read -r ref; do
  [[ -f "$ref" ]] || fail "Workspace shared-doc reference points to missing file: ${ref}"
done < <(rg --no-filename -o 'docs/workflows/[^` )]+/shared-docs\.md' docs/workflows || true)

if ! bash -n scripts/start-workflow.sh; then
  fail "scripts/start-workflow.sh has shell syntax errors"
fi

if ! bash -n scripts/status-workflow.sh; then
  fail "scripts/status-workflow.sh has shell syntax errors"
fi

if ! bash -n scripts/test-harness.sh; then
  fail "scripts/test-harness.sh has shell syntax errors"
fi

if ! bash -n scripts/harness-flow-check.sh; then
  fail "scripts/harness-flow-check.sh has shell syntax errors"
fi

if ! bash -n scripts/list-active-branches.sh; then
  fail "scripts/list-active-branches.sh has shell syntax errors"
fi

if ! bash -n scripts/cleanup-merged-branches.sh; then
  fail "scripts/cleanup-merged-branches.sh has shell syntax errors"
fi

while IFS= read -r script_file; do
  if ! bash -n "$script_file"; then
    fail "${script_file} has shell syntax errors"
  fi
done < <(find scripts/aws -type f -name '*.sh' 2>/dev/null | sort || true)

if [[ "$failures" -gt 0 ]]; then
  echo "Harness validation failed with ${failures} issue(s)." >&2
  exit 1
fi

echo "Harness validation passed."
