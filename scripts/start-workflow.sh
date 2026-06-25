#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/start-workflow.sh [--dry-run] [--no-checkout] [--allow-dirty] [--no-issue] <type> <short-kebab-name> "<title>"

Examples:
  scripts/start-workflow.sh feature task-board "Task board MVP"
  scripts/start-workflow.sh --dry-run feature project-bootstrap "Project bootstrap"
  scripts/start-workflow.sh --no-checkout fix invalid-task-title "Invalid task title handling"
  scripts/start-workflow.sh --no-issue chore local-notes "Local notes only"

Allowed types:
  feature, fix, docs, test, chore, hotfix
USAGE
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

issue_title_prefix() {
  case "$1" in
    feature) printf '[기능]' ;;
    fix) printf '[버그]' ;;
    docs) printf '[문서/운영]' ;;
    hotfix) printf '[긴급수정]' ;;
    chore) printf '[문서/운영]' ;;
    test) printf '[검증]' ;;
    *) printf '[작업]' ;;
  esac
}

issue_labels_for_type() {
  case "$1" in
    feature) printf '%s\n' feature ;;
    fix) printf '%s\n' bug ;;
    docs) printf '%s\n%s\n' documentation ops ;;
    hotfix) printf '%s\n' hotfix ;;
    chore) printf '%s\n' ops ;;
    test) ;;
  esac
}

prefixed_issue_title() {
  local type="$1"
  local raw_title="$2"
  local prefix

  prefix="$(issue_title_prefix "$type")"
  case "$raw_title" in
    \[*\]*) printf '%s\n' "$raw_title" ;;
    *) printf '%s %s\n' "$prefix" "$raw_title" ;;
  esac
}

write_issue_body() {
  local file="$1"
  local type="$2"
  local branch="$3"
  local workspace="$4"
  local raw_title="$5"
  local closing_keyword="$6"
  local type_label

  case "$type" in
    feature) type_label="기능 Phase" ;;
    fix) type_label="버그 수정" ;;
    docs) type_label="문서/운영 개선" ;;
    test) type_label="검증 보강" ;;
    chore) type_label="운영 정리" ;;
    hotfix) type_label="긴급수정" ;;
    *) type_label="작업" ;;
  esac

  cat > "$file" <<EOF_ISSUE
## 1. 이슈 요약

- 요약: ${raw_title}
- 작업 유형: ${type_label}
- Branch: \`${branch}\`
- Branch workspace: \`${workspace}\`
- PR closing keyword: ${closing_keyword:-PR 생성 전 issue 번호 확정 후 기록}

## 2. 목표

- branch workspace와 PR closing keyword를 연결하고, 구체 범위와 검증 결과는 workspace 문서에서 계속 업데이트한다.

## 3. 작업 범위

- [ ] \`${workspace}/plan.md\` 기준 범위를 확정한다.
- [ ] \`${workspace}/quality.md\`에 검증 결과를 기록한다.
- [ ] \`${workspace}/report.md\`에 완료 증거를 기록한다.

## 4. 제외 범위

- 이번 이슈 생성 시점에는 제품/API/schema 요구사항을 새로 확정하지 않는다.
- remote issue/PR 상태 보정은 별도 명시 지시 없이는 진행하지 않는다.

## 5. 관련 문서 / Source of Truth

- Development Operations: \`docs/04-development-guide.md\`
- Workflow: \`docs/08-development-workflow.md\`
- Git Sync Policy: \`docs/11-git-sync-policy.md\`
- Quality Gates: \`docs/12-quality-gates.md\`
- Branch workspace: \`${workspace}\`

## 6. Acceptance Criteria

- [ ] 작업 범위가 workspace 문서와 일치한다.
- [ ] 필요한 validation 또는 skip reason이 \`quality.md\`에 기록된다.
- [ ] PR을 만들 경우 PR body에 closing keyword가 포함된다.

## 7. Regression / Failure Scenario

- 깨지면 안 되는 것: branch/workspace/issue/PR 연결과 closing keyword 추적.
- 확인해야 할 실패 시나리오: issue body 줄바꿈이 깨지거나, PR closing keyword가 누락되는 경우.

## 8. Manual Verification

1. 이 issue 제목과 본문이 한국어 협업 산출물 규칙을 따르는지 확인한다.
2. Branch와 workspace 경로가 맞는지 확인한다.
3. PR 생성 전 \`sync.md\`의 linked issue와 closing keyword가 맞는지 확인한다.

## 9. 영향도

- [ ] 팀 협업 흐름
- [ ] PR readiness
- [ ] Issue / Project 운영
- [ ] 문서 일관성
- [ ] 영향도 낮음

상세:

- \`scripts/start-workflow.sh\` 자동 생성 issue.

## 10. 참고 링크 / 로그

- Workspace: \`${workspace}\`
EOF_ISSUE
}

worktree_dirty() {
  [[ -n "$(git status --porcelain --untracked-files=normal)" ]]
}

print_untracked_checkpoint_exclusions() {
  local untracked

  untracked="$(git ls-files --others --exclude-standard)"
  if [[ -z "$untracked" ]]; then
    return 0
  fi

  echo "Untracked files are not included in the automatic checkpoint commit."
  echo "Review and commit them manually if they belong to the current branch:"
  printf '%s\n' "$untracked" | sed 's/^/  - /'
}

auto_commit_before_branch_switch() {
  local target_branch="$1"
  local current_branch

  current_branch="$(git branch --show-current 2>/dev/null || true)"

  if [[ -z "$current_branch" ]]; then
    if worktree_dirty; then
      echo "Cannot auto-commit before switching branches from a detached HEAD." >&2
      echo "Commit manually, switch to a named branch, or use --no-checkout." >&2
      exit 1
    fi
    return 0
  fi

  if [[ "$current_branch" == "$target_branch" ]]; then
    return 0
  fi

  if ! worktree_dirty; then
    return 0
  fi

  if [[ -n "$(git diff --name-only --diff-filter=U)" ]]; then
    echo "Cannot auto-commit before switching branches because unresolved conflicts exist." >&2
    echo "Resolve conflicts manually before starting another workflow." >&2
    exit 1
  fi

  echo "Dirty worktree detected on ${current_branch}; creating checkpoint commit before switching to ${target_branch}."
  print_untracked_checkpoint_exclusions
  git add -u

  if git diff --cached --quiet; then
    echo "No tracked changes to checkpoint; continuing without checkpoint commit."
    return 0
  fi

  git commit -m "chore: checkpoint ${current_branch} before ${target_branch}"
}

dry_run=0
checkout=1
allow_dirty=0
create_issue=1
issue_project_owner="${ASKLAKE_GITHUB_PROJECT_OWNER:-JUNGLE-TEAM1}"
issue_project_number="${ASKLAKE_GITHUB_PROJECT_NUMBER:-3}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=1
      shift
      ;;
    --no-checkout)
      checkout=0
      shift
      ;;
    --allow-dirty)
      allow_dirty=1
      echo "Note: --allow-dirty is deprecated; dirty worktrees are checkpoint-committed before branch switches."
      shift
      ;;
    --create-issue)
      create_issue=1
      shift
      ;;
    --no-issue)
      create_issue=0
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

if [[ $# -ne 3 ]]; then
  usage
  exit 1
fi

branch_type="$1"
branch_slug="$2"
title="$3"
branch_name="${branch_type}/${branch_slug}"
workspace_dir="docs/workflows/${branch_type}/${branch_slug}"
main_branch="main"

case "$branch_type" in
  feature|fix|docs|test|chore|hotfix) ;;
  *)
    echo "Invalid branch type: ${branch_type}" >&2
    usage
    exit 1
    ;;
esac

if [[ ! "$branch_slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Invalid branch slug: ${branch_slug}" >&2
  echo "Use lowercase kebab-case, for example: task-board or project-bootstrap" >&2
  exit 1
fi

if [[ "$title" =~ [[:cntrl:]] ]]; then
  echo "Invalid title: control characters are not allowed" >&2
  exit 1
fi

echo "Branch: ${branch_name}"
echo "Workspace: ${workspace_dir}"
echo "Title: ${title}"
if [[ "$create_issue" -eq 1 ]]; then
  echo "GitHub issue: create by team rule"
  echo "GitHub project: add to ${issue_project_owner} project ${issue_project_number}"
else
  echo "GitHub issue: skipped by --no-issue"
fi

if [[ "$dry_run" -eq 1 ]]; then
  echo "Dry run only. No branch or files created."
  if [[ "$create_issue" -eq 1 ]]; then
    echo "Dry run only. No GitHub issue created."
  fi
  exit 0
fi

if [[ "$checkout" -eq 1 ]] && ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Cannot create or switch branches outside a Git worktree." >&2
  if [[ -f .git ]]; then
    gitdir_hint="$(sed -n 's/^gitdir: //p' .git)"
    case "$gitdir_hint" in
      [A-Za-z]:/*)
        echo "This worktree metadata points at a Windows-style Git path." >&2
        echo "If you plan to run the workspace from WSL, recreate the worktree with WSL git so the metadata uses Linux paths." >&2
        ;;
      /mnt/*|/*)
        echo "This worktree metadata points at a POSIX Git path." >&2
        echo "If you plan to run the workspace from Windows Git, recreate the worktree with Windows Git so the metadata uses Windows paths." >&2
        ;;
    esac
  fi
  echo "Use --no-checkout to generate workflow files without Git branch operations." >&2
  exit 1
fi

if [[ "$checkout" -eq 1 ]]; then
  auto_commit_before_branch_switch "$branch_name"
fi

if [[ "$checkout" -eq 1 ]]; then
  if git rev-parse --verify --quiet "$branch_name" >/dev/null; then
    git switch "$branch_name"
  else
    git switch -c "$branch_name"
  fi
fi

mkdir -p "$workspace_dir"

current_branch="not a git worktree"
base_commit="unavailable"
sync_result="Git sync not performed by start-workflow.sh; record approved pull/merge/rebase results here."

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  current_branch="$(git branch --show-current 2>/dev/null || echo detached)"
  base_commit="$(git rev-parse --short HEAD 2>/dev/null || echo unborn)"
  sync_result="Workspace created from ${current_branch} at ${base_commit}; 자동 pull/merge/rebase는 실행하지 않음."
fi

issue_ref=""
issue_link=""
issue_creation_result="not requested"
issue_project_result="not requested"
pr_closing_keyword=""
sync_file="${workspace_dir}/sync.md"
issue_title="$(prefixed_issue_title "$branch_type" "$title")"

if [[ "$create_issue" -eq 1 ]]; then
  issue_creation_result="skipped: GitHub CLI is not available"
  existing_issue=""

  if [[ -f "$sync_file" ]]; then
    existing_issue="$(section_value "$sync_file" "## Push / PR" "- linked GitHub issue:")"
  fi

  if [[ -n "$existing_issue" ]]; then
    issue_ref="$existing_issue"
    if [[ "$existing_issue" =~ ^#([0-9]+)$ ]]; then
      pr_closing_keyword="Closes ${existing_issue}"
    fi
    issue_creation_result="skipped: linked GitHub issue already recorded"
  elif command -v gh >/dev/null 2>&1; then
    if gh auth status >/dev/null 2>&1; then
      issue_body_file="$(mktemp)"
      write_issue_body "$issue_body_file" "$branch_type" "$branch_name" "$workspace_dir" "$title" "$pr_closing_keyword"
      issue_create_args=(issue create --title "$issue_title" --body-file "$issue_body_file")
      while IFS= read -r issue_label; do
        [[ -n "$issue_label" ]] && issue_create_args+=(--label "$issue_label")
      done < <(issue_labels_for_type "$branch_type")

      set +e
      issue_output="$(gh "${issue_create_args[@]}" 2>&1)"
      issue_status=$?
      set -e
      rm -f "$issue_body_file"

      if [[ "$issue_status" -eq 0 ]]; then
        issue_link="$(printf '%s\n' "$issue_output" | tail -n 1)"
        issue_number="$(printf '%s\n' "$issue_link" | sed -n 's#.*/issues/\([0-9][0-9]*\).*#\1#p')"
        if [[ -n "$issue_number" ]]; then
          issue_ref="#${issue_number}"
          pr_closing_keyword="Closes ${issue_ref}"
        else
          issue_ref="$issue_link"
        fi
        issue_creation_result="created"

        if [[ -n "$issue_link" ]]; then
          set +e
          project_item_id="$(gh project item-add "$issue_project_number" --owner "$issue_project_owner" --url "$issue_link" --format json --jq .id 2>&1)"
          project_status=$?
          set -e

          if [[ "$project_status" -eq 0 ]]; then
            issue_project_result="added to ${issue_project_owner} project ${issue_project_number}"

            set +e
            project_id="$(gh project view "$issue_project_number" --owner "$issue_project_owner" --format json --jq .id 2>&1)"
            project_id_status=$?
            status_field_record="$(gh project field-list "$issue_project_number" --owner "$issue_project_owner" --format json --jq '.fields[] | select(.name == "Status") | [.id, (.options[] | select(.name == "In Progress") | .id)] | @tsv' 2>&1)"
            status_field_status=$?
            set -e

            if [[ "$project_id_status" -eq 0 && "$status_field_status" -eq 0 && -n "$project_id" && -n "$status_field_record" ]]; then
              status_field_id="${status_field_record%%$'\t'*}"
              in_progress_option_id="${status_field_record#*$'\t'}"

              set +e
              status_output="$(gh project item-edit --id "$project_item_id" --project-id "$project_id" --field-id "$status_field_id" --single-select-option-id "$in_progress_option_id" 2>&1)"
              status_update_status=$?
              set -e

              if [[ "$status_update_status" -eq 0 ]]; then
                issue_project_result="${issue_project_result}; status set to In Progress"
              else
                issue_project_result="${issue_project_result}; status update failed: ${status_output//$'\n'/ }"
              fi
            else
              issue_project_result="${issue_project_result}; status lookup failed: ${project_id//$'\n'/ } ${status_field_record//$'\n'/ }"
            fi
          else
            issue_project_result="failed: ${project_item_id//$'\n'/ }"
          fi
        else
          issue_project_result="skipped: issue link is missing"
        fi
      else
        issue_creation_result="failed: ${issue_output//$'\n'/ }"
        issue_project_result="skipped: issue creation failed"
      fi
    else
      issue_creation_result="skipped: GitHub CLI is not authenticated"
      issue_project_result="skipped: GitHub CLI is not authenticated"
    fi
  else
    issue_project_result="skipped: GitHub CLI is not available"
  fi
fi

if [[ ! -f "${workspace_dir}/plan.md" ]]; then
  cat > "${workspace_dir}/plan.md" <<EOF_PLAN
# ${title} 계획

## 브랜치

- Branch: \`${branch_name}\`
- Workspace: \`${workspace_dir}\`
- Created: $(date +%Y-%m-%d)

## 목표

- 

## 범위

- 

## 범위 제외

- 

## Source of Truth 문맥

- \`AGENTS.md\`
- \`docs/00-layer-map.md\`
- \`docs/08-development-workflow.md\`
- \`docs/12-quality-gates.md\`
- \`docs/14-decision-option-brief.md\`
- \`docs/15-context-budget-rule.md\`

## 구현 프롬프트

\`\`\`text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
\`\`\`

## 검증 프롬프트

\`\`\`text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 \`quality.md\`와 workspace report에 증거를 기록한다.
\`\`\`

## 내부 단계별 프롬프트

- not needed

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 \`not needed\`로 둔다.

### Step N - [STEP_NAME]

#### 목표

- [STEP_GOAL]

#### 범위

- [STEP_SCOPE]

#### 범위 제외

- [STEP_OUT_OF_SCOPE]

#### 구현 프롬프트

\`\`\`text
@AGENTS.md @[RELEVANT_DOCS]

[IMPLEMENTATION_REQUEST]
\`\`\`

#### 검증 프롬프트

\`\`\`text
@AGENTS.md @[RELEVANT_DOCS]

[VERIFICATION_REQUEST]
\`\`\`

#### 완료 기준

- [ ] [STEP_COMPLETION_CRITERION]

## 완료 기준

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
EOF_PLAN
fi

if [[ ! -f "${workspace_dir}/notes.md" ]]; then
  cat > "${workspace_dir}/notes.md" <<EOF_NOTES
# ${title} 노트

## 진행 메모

- 

## 결정

- 

## 열린 질문

- 

## 링크 / 증거

- 
EOF_NOTES
fi

if [[ ! -f "${workspace_dir}/report.md" ]]; then
  cat > "${workspace_dir}/report.md" <<EOF_REPORT
# ${title} 보고서

## Short Report / 짧은 보고

- Type: ${branch_type}
- Branch/work location: \`${branch_name}\`, \`${workspace_dir}\`
- Date: $(date +%Y-%m-%d)
- Workspace state: draft
- Context Budget mode: Lite Read
- Primary context read:
- Escalated context read:
- Context omitted intentionally:
- Changed: 
- Verified: 
- Remaining: 
- Next context: 
- Risk: 
EOF_REPORT
fi

if [[ ! -f "${workspace_dir}/quality.md" ]]; then
  cat > "${workspace_dir}/quality.md" <<EOF_QUALITY
# ${title} 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: draft

## TDD Plan / TDD 계획

- Applies: TBD
- Reason: 
- Failing test first: 
- Expected failure command/result: 
- Pass command/result: 
- Refactor notes: 

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint |  |  |  |
| unit/focused test |  |  |  |
| integration/contract test |  |  |  |
| build/typecheck |  |  |  |
| harness validation | \`scripts/validate-harness.sh\` |  |  |
| strict harness validation | \`scripts/validate-harness.sh --strict\` |  |  |

## CI/CD Gate / CI-CD 게이트

- CI required: TBD
- CI result: 
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
|  |  |  |
EOF_QUALITY
fi

if [[ ! -f "${workspace_dir}/decisions.md" ]]; then
  cat > "${workspace_dir}/decisions.md" <<EOF_DECISIONS
# ${title} 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 \`docs/14-decision-option-brief.md\` 형식을 사용한다.

- Decision status: none

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
|  |  |  |  |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
|  |  |  |  |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
|  |  |  |
EOF_DECISIONS
fi

echo "Created or confirmed workflow files:"
echo "- ${workspace_dir}/plan.md"
echo "- ${workspace_dir}/notes.md"
if [[ ! -f "${workspace_dir}/shared-docs.md" ]]; then
  cat > "${workspace_dir}/shared-docs.md" <<EOF_SHARED
# ${title} 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| \`docs/02-architecture.md\` |  |  |  |
| \`docs/03-interface-reference.md\` |  |  |  |
| \`docs/05-acceptance-scenarios-and-checklist.md\` |  |  |  |
| \`docs/06-regression-and-failure-scenarios.md\` |  |  |  |
| \`docs/07-manual-verification-playbook.md\` |  |  |  |

## Integration Notes / 통합 메모

- 

## Conflicts To Resolve / 해결할 충돌

- 
EOF_SHARED
fi

if [[ ! -f "${workspace_dir}/sources.md" ]]; then
  cat > "${workspace_dir}/sources.md" <<EOF_SOURCES
# ${title} source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- 

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- \`plan.md\`
- \`shared-docs.md\`
- \`report.md\`
- \`quality.md\`
- \`decisions.md\`
- \`confirmations.md\`
- \`sync.md\`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Integration Notes / 통합 메모

- 
EOF_SOURCES
fi

if [[ ! -f "${workspace_dir}/confirmations.md" ]]; then
  cat > "${workspace_dir}/confirmations.md" <<EOF_CONFIRM
# ${title} 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: pending
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response:

## Contract Confirm / 계약 확인

- Status: pending
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: 

## Scope Change Confirm / 범위 변경 확인

- Status: not needed
- Ask human when:
  - 작업이 \`plan.md\` 범위를 넘을 때
  - 기능을 다른 branch로 분리해야 할 때
  - 구현 중 새 제품 결정이 드러날 때
- Human response: 

## Verification Confirm / 검증 확인

- Status: pending
- Ask human to confirm:
  - test/build/smoke 명령
  - TDD 증거 또는 skip reason
  - CI/check 명령
  - manual verification 경로
  - completion criteria
- Human response: 

## Quality Gate Confirm / 품질 게이트 확인

- Status: pending
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: 

## Git Sync Confirm / Git sync 확인

- Status: pending
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: 

## Sync Conflict Confirm / sync 충돌 확인

- Status: not needed
- Ask human when:
  - Phase 중 main이 바뀐 경우
  - 공유 Source of Truth 문서가 이 branch와 충돌하는 경우
  - merge/rebase/pull/PR merge/finalize/cleanup action이 필요한 경우
- Human response: 

## PR Conflict Confirm / PR 충돌 확인

- Status: not needed
- Ask human when:
  - GitHub PR이 conflict 상태를 보고하는 경우
  - \`gh pr view\` 또는 PR status에서 conflict가 의심되는 경우
  - 승인된 merge/rebase/pull 중 conflict가 발생한 경우
  - \`git status\`에 unmerged path가 있는 경우
  - Source of Truth proposal이 base/main 변경과 충돌하는 경우
- Confirm:
  - conflict type
  - affected files
  - resolution path
  - revalidation commands/result
- Relationship: \`Sync Conflict Confirm\`은 main/upstream sync 선택이고, \`Integration Conflict Confirm\`은 여러 source branch 계약 충돌 선택이다. \`PR Conflict Confirm\`은 open PR 또는 PR-ready branch의 conflict 해결 경로 선택이다.
- Human response:

## Completion Confirm / 완료 확인

- Status: pending
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: 

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 
EOF_CONFIRM
fi

if [[ ! -f "${workspace_dir}/next-actions.md" ]]; then
  cat > "${workspace_dir}/next-actions.md" <<EOF_NEXT
# ${title} 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: workspace created
- Summary: branch workspace는 생성되었고, scope는 아직 사람 확인이 필요하다.

## Recommended Next Action / 권장 다음 행동

- Scope Confirm을 요청한다.
- Reason: branch/workspace, 포함 범위, 제외 범위, 영향받는 문서가 명확해지기 전에는 구현을 시작하지 않는다.

## Options / 선택지

1. 범위를 확인하고 Contract Confirm으로 진행한다.
2. 구현 전에 범위를 수정한다.
3. 일부 작업을 다른 branch로 분리한다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- 

## Next AI Action / 다음 AI 행동

- option 1이면 \`confirmations.md\`를 업데이트하고 공유 contract를 초안 작성 또는 확인한다.
- option 2이면 \`plan.md\`와 \`shared-docs.md\`를 업데이트한다.
- option 3이면 \`scripts/start-workflow.sh\`로 다른 workspace를 만든다.
- option 4이면 pause reason을 \`notes.md\`에 기록한다.
EOF_NEXT
fi

if [[ ! -f "${workspace_dir}/sync.md" ]]; then
  cat > "${workspace_dir}/sync.md" <<EOF_SYNC
# ${title} Git Sync

main 동기화와 integration readiness를 기록한다.
PR-ready 조건이 clear이면 feature branch push와 PR 생성은 자동 실행할 수 있다.
사람 확인 없이 pull, merge, rebase, PR merge, finalize, issue close, branch cleanup action을 실행하지 않는다.

## Start Sync / 시작 sync

- main branch: ${main_branch}
- current branch: ${current_branch}
- base commit: ${base_commit}
- pulled at:
- command:
- result: ${sync_result}

## Mid-Phase Sync Checks / 진행 중 sync 확인

| Checked At | Upstream Changes | Impacted Source of Truth | Action |
| --- | --- | --- | --- |
|  |  |  |  |

## Pre-Merge Sync

- main commit:
- conflicts:
- validation:
- result:
- deferral reason:

## PR Conflict Resolution

- conflict detected at:
- conflict detection command:
- conflict type:
- affected files:
- resolution path:
- resolved files:
- revalidation:
- remaining risk:

## Push / PR

- linked GitHub issue: ${issue_ref}
- issue link: ${issue_link}
- issue creation result: ${issue_creation_result}
- issue project result: ${issue_project_result}
- PR closing keyword: ${pr_closing_keyword}
- pushed branch:
- PR link:
- merge status:
- issue close status:
EOF_SYNC
elif [[ "$create_issue" -eq 1 ]]; then
  set_field "${workspace_dir}/sync.md" "- linked GitHub issue:" "$issue_ref"
  set_field "${workspace_dir}/sync.md" "- issue link:" "$issue_link"
  set_field "${workspace_dir}/sync.md" "- issue creation result:" "$issue_creation_result"
  set_field "${workspace_dir}/sync.md" "- issue project result:" "$issue_project_result"
  set_field "${workspace_dir}/sync.md" "- PR closing keyword:" "$pr_closing_keyword"
fi

echo "- ${workspace_dir}/report.md"
echo "- ${workspace_dir}/quality.md"
echo "- ${workspace_dir}/decisions.md"
echo "- ${workspace_dir}/shared-docs.md"
echo "- ${workspace_dir}/sources.md"
echo "- ${workspace_dir}/confirmations.md"
echo "- ${workspace_dir}/next-actions.md"
echo "- ${workspace_dir}/sync.md"
