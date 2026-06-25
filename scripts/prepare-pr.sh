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
issue_project_owner="${ASKLAKE_GITHUB_PROJECT_OWNER:-JUNGLE-TEAM1}"
issue_project_number="${ASKLAKE_GITHUB_PROJECT_NUMBER:-3}"

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
quality_file="${workspace}/quality.md"

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

set_issue_project_status() {
  local issue_url="$1"
  local status_name="$2"
  local project_item_id
  local project_status
  local project_id
  local project_id_status
  local status_field_record
  local status_field_status
  local status_field_id
  local status_option_id
  local status_output
  local status_update_status

  if ! command -v gh >/dev/null 2>&1; then
    printf 'skipped: GitHub CLI is not available'
    return 0
  fi

  if ! gh auth status >/dev/null 2>&1; then
    printf 'skipped: GitHub CLI is not authenticated'
    return 0
  fi

  set +e
  project_item_id="$(gh project item-add "$issue_project_number" --owner "$issue_project_owner" --url "$issue_url" --format json --jq .id 2>&1)"
  project_status=$?
  set -e

  if [[ "$project_status" -ne 0 ]]; then
    printf 'failed: %s' "${project_item_id//$'\n'/ }"
    return 0
  fi

  set +e
  project_id="$(gh project view "$issue_project_number" --owner "$issue_project_owner" --format json --jq .id 2>&1)"
  project_id_status=$?
  status_field_record="$(gh project field-list "$issue_project_number" --owner "$issue_project_owner" --format json --jq '.fields[] | select(.name == "Status") | [.id, (.options[] | select(.name == "'"$status_name"'") | .id)] | @tsv' 2>&1)"
  status_field_status=$?
  set -e

  if [[ "$project_id_status" -ne 0 || "$status_field_status" -ne 0 || -z "$project_id" || -z "$status_field_record" ]]; then
    printf 'status lookup failed: %s %s' "${project_id//$'\n'/ }" "${status_field_record//$'\n'/ }"
    return 0
  fi

  status_field_id="${status_field_record%%$'\t'*}"
  status_option_id="${status_field_record#*$'\t'}"

  set +e
  status_output="$(gh project item-edit --id "$project_item_id" --project-id "$project_id" --field-id "$status_field_id" --single-select-option-id "$status_option_id" 2>&1)"
  status_update_status=$?
  set -e

  if [[ "$status_update_status" -eq 0 ]]; then
    printf 'set to %s in %s project %s' "$status_name" "$issue_project_owner" "$issue_project_number"
  else
    printf 'status update failed: %s' "${status_output//$'\n'/ }"
  fi
}

ensure_issue_open_for_pr() {
  local issue_number="$1"
  local issue_state
  local issue_state_status
  local reopen_output
  local reopen_status

  if ! command -v gh >/dev/null 2>&1; then
    printf 'skipped: GitHub CLI is not available'
    return 0
  fi

  if ! gh auth status >/dev/null 2>&1; then
    printf 'skipped: GitHub CLI is not authenticated'
    return 0
  fi

  set +e
  issue_state="$(gh issue view "$issue_number" --json state --jq .state 2>&1)"
  issue_state_status=$?
  set -e

  if [[ "$issue_state_status" -ne 0 ]]; then
    printf 'state lookup failed: %s' "${issue_state//$'\n'/ }"
    return 0
  fi

  if [[ "$issue_state" != "CLOSED" ]]; then
    printf 'already open'
    return 0
  fi

  set +e
  reopen_output="$(gh issue reopen "$issue_number" --comment "Reopened for active PR lifecycle. PR open requires the linked issue to remain open; merge/finalize will close it and move Project status to Done." 2>&1)"
  reopen_status=$?
  set -e

  if [[ "$reopen_status" -eq 0 ]]; then
    printf 'reopened closed issue before PR open'
  else
    printf 'reopen failed: %s' "${reopen_output//$'\n'/ }"
  fi
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

title="PR 인계: ${branch}"
if [[ -f "$report_file" ]]; then
  report_title="$(sed -n '1s/^# //p' "$report_file")"
  [[ -n "$report_title" ]] && title="$report_title"
elif [[ -f "$plan_file" ]]; then
  plan_title="$(sed -n '1s/^# //p' "$plan_file")"
  [[ -n "$plan_title" ]] && title="$plan_title"
fi

workspace_type="${workspace#docs/workflows/}"
workspace_type="${workspace_type%%/*}"
phase_or_hotfix="$workspace_type"
case "$workspace_type" in
  feature) phase_or_hotfix="기능 Phase" ;;
  hotfix) phase_or_hotfix="긴급수정" ;;
  docs) phase_or_hotfix="문서/운영 작은 변경" ;;
  chore) phase_or_hotfix="정리 작업" ;;
  test) phase_or_hotfix="테스트 fixture" ;;
esac

quality_status=""
tdd_status=""
if [[ -f "$quality_file" ]]; then
  quality_status="$(first_value "$quality_file" "- Quality gate status:")"
  tdd_status="$(first_value "$quality_file" "- Applies:")"
fi
emptyish "$quality_status" && quality_status="PR review 전 기록 필요"
emptyish "$tdd_status" && tdd_status="PR review 전 기록 필요"

changed_summary=""
verified_summary=""
remaining_summary=""
risk_summary=""
if [[ -f "$report_file" ]]; then
  changed_summary="$(first_value "$report_file" "- Changed:")"
  verified_summary="$(first_value "$report_file" "- Verified:")"
  remaining_summary="$(first_value "$report_file" "- Remaining:")"
  risk_summary="$(first_value "$report_file" "- Risk:")"
fi
emptyish "$changed_summary" && changed_summary="workspace report의 Changed 항목을 확인해야 한다."
emptyish "$verified_summary" && verified_summary="workspace quality/report의 검증 결과를 확인해야 한다."
emptyish "$remaining_summary" && remaining_summary="남은 작업 없음 또는 report.md 확인 필요."
emptyish "$risk_summary" && risk_summary="특이 위험 없음 또는 report.md 확인 필요."

start_sync_result="$(section_value "$sync_file" "## Start Sync / 시작 sync" "- result:")"
pre_merge_result="$(section_value "$sync_file" "## Pre-Merge Sync" "- result:")"
pre_merge_deferral="$(section_value "$sync_file" "## Pre-Merge Sync" "- deferral reason:")"
mid_phase_sync="workspace sync.md 참고"
pre_pr_sync="${pre_merge_result:-${pre_merge_deferral:-PR review 전 기록 필요}}"
pr_readiness="\`scripts/status-workflow.sh ${workspace}\` PR handoff 전 확인 필요"

pr_body_file="$(mktemp)"
cat > "$pr_body_file" <<EOF_BODY
# Pull Request

## 1. PR 요약

이번 PR은 ${title} 작업을 리뷰 가능한 상태로 인계한다.

- 연결된 Issue: ${closing_keyword:-연결된 issue 없음}
- Branch: \`${branch}\`
- Branch workspace: \`${workspace}\`
- 상태: 리뷰 요청

## 2. 변경 내용

${changed_summary}

이 변경은 \`${workspace}\`의 계획과 보고서를 기준으로 정리했다. 리뷰어는 위 설명이 실제 diff와 맞는지, 그리고 이번 PR에서 의도적으로 제외한 범위가 남은 일에 분명히 남아 있는지 확인하면 된다.

이번 PR에서 아직 남은 일 또는 제외한 일은 다음과 같다. ${remaining_summary}

## 3. 검증

이번 PR은 workspace quality gate와 report에 남긴 검증 증거를 기준으로 확인했다.

- Quality gate status: ${quality_status}
- TDD 상태: ${tdd_status}
- 실행한 검증: ${verified_summary}

실행하지 못한 검증이 있다면 workspace \`quality.md\`의 skipped checks 또는 report의 remaining/risk 항목을 확인한다.

## 4. 영향 범위

이 PR의 영향 범위는 \`${phase_or_hotfix}\` 작업 범위와 workspace 문서에 기록된 Source of Truth 영향도를 따른다.

- UI 영향: 변경 내용과 workspace report 기준으로 확인
- API/schema 영향: interface/schema 변경이 있으면 \`docs/02-architecture.md\` 또는 \`docs/03-interface-reference.md\` 확인
- data/migration 영향: migration 또는 data 변경이 있으면 workspace \`quality.md\` 확인
- security/privacy 영향: secret, credential, private key 포함 여부 확인
- 문서/운영 영향: workspace \`shared-docs.md\`, \`decisions.md\`, \`report.md\` 확인

secret, credential, license 변경 여부는 PR review에서 별도로 확인한다.

## 5. 리뷰어에게 부탁할 부분

먼저 이 PR의 변경 설명과 실제 diff가 같은 방향을 가리키는지 봐 주세요.

그 다음 \`${workspace}\`의 \`quality.md\`와 \`report.md\`에서 검증 결과가 충분한지 확인해 주세요.

마지막으로 남은 위험을 확인해 주세요. ${risk_summary}

## 6. 남은 일 / 제외한 일

이번 PR에서 남은 일 또는 제외한 일은 다음과 같다.

- ${remaining_summary}

후속 Issue/PR은 linked issue, workspace \`next-actions.md\`, report의 next context를 기준으로 이어간다.

## 7. Merge 전 확인

- CI/check가 통과했는지 확인합니다.
- linked issue와 closing keyword가 맞는지 확인합니다.
- Start Sync: ${start_sync_result:-PR review 전 기록 필요}
- Mid-Phase Sync: ${mid_phase_sync}
- Pre-Merge 또는 Pre-PR Sync: ${pre_pr_sync}
- PR readiness from \`scripts/status-workflow.sh\`: ${pr_readiness}
- merge 후 issue close와 Project 상태가 맞는지 확인합니다.
- merge/finalize/cleanup은 사람 확인 후 진행합니다.
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

  if [[ -n "$issue_number" ]]; then
    issue_reopen_result="$(ensure_issue_open_for_pr "$issue_number")"
    set_field "$sync_file" "- issue reopen result:" "$issue_reopen_result"
    echo "Issue #${issue_number} reopen check: ${issue_reopen_result}"
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
    issue_project_result="$(set_issue_project_status "https://github.com/JUNGLE-TEAM1/NMM_team1/issues/${issue_number}" "Review")"
    set_field "$sync_file" "- issue project result:" "$issue_project_result"
    echo "Issue #${issue_number} project status: ${issue_project_result}"
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
    issue_project_result="$(set_issue_project_status "https://github.com/JUNGLE-TEAM1/NMM_team1/issues/${issue_number}" "Done")"
    set_field "$sync_file" "- issue project result:" "$issue_project_result"
    echo "Issue #${issue_number} is already CLOSED."
    echo "Issue #${issue_number} project status: ${issue_project_result}"
  else
    gh issue close "$issue_number" --comment "Closed after PR #${pr_number} was merged. PR: ${pr_link}"
    set_field "$sync_file" "- merge status:" "merged"
    set_field "$sync_file" "- issue close status:" "CLOSED"
    issue_project_result="$(set_issue_project_status "https://github.com/JUNGLE-TEAM1/NMM_team1/issues/${issue_number}" "Done")"
    set_field "$sync_file" "- issue project result:" "$issue_project_result"
    echo "Closed issue #${issue_number} after PR #${pr_number} merge."
    echo "Issue #${issue_number} project status: ${issue_project_result}"
  fi

  if [[ "$finalize" -eq 1 ]]; then
    scripts/cleanup-merged-branches.sh
  fi
fi

rm -f "$pr_body_file"
