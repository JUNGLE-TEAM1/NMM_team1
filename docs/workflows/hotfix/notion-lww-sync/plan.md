# Notion issue sync last-write-wins hotfix Plan

## Branch

- Branch: `hotfix/notion-lww-sync`
- Workspace: `docs/workflows/hotfix/notion-lww-sync`
- Created: 2026-06-26

## Goal

- GitHub Project 3과 Notion `GitHub Issues - JUNGLE-TEAM1` 동기화에서 Notion row 부재/archived 상태를 삭제 명령으로 해석하는 기존 기준을 제거한다.
- GitHub Issue/Project item과 Notion page의 최근 수정 시각을 비교해 last-write-wins 양방향 동기화를 수행한다.
- closed 이슈는 삭제하지 않고 Project Status/Notion Status를 `Done`/`closed`로 보존한다.

## Scope

- `.github/scripts/notion-issue-sync.js`의 매칭, 방향 결정, conflict 기록, idempotent write 로직 수정
- `.github/workflows/notion-issue-sync.yml`의 dry-run 입력, schedule/issues/repository_dispatch trigger 정리
- 외부 API 없이 실행 가능한 Node smoke test 추가
- Hotfix workspace와 evidence report 갱신

## Out Of Scope

- Notion database schema 변경
- GitHub/Notion 실제 운영 데이터 수동 수정
- pull, merge, rebase, push, PR 생성, 배포 실행
- Notion에서 명시적 삭제 tombstone을 새로 설계하는 작업

## Source Of Truth Context

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/04-development-guide.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/reports/README.md`

## Implementation Prompt

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

Implement only the work described in this branch workspace.
Start with Lite Read and escalate only when risk signals require more context.
Use TDD when the branch changes core logic, regression risk, integration contracts, or bug fixes.
Use Decision Option Briefs for high-impact choices before implementation.
Do not expand scope without updating this plan.
```

## Verification Prompt

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

Verify the branch work and record evidence in `quality.md` and this workspace report.
```

## Completion Criteria

- [x] Scope completed
- [x] TDD status recorded
- [x] Acceptance checked
- [x] Regression/failure scenario checked
- [x] Manual verification recorded
- [x] CI/check commands recorded
- [x] Report updated
