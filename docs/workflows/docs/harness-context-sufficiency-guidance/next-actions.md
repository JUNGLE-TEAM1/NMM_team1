# Harness context sufficiency guidance 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete pending PR/sync decision
- Summary: Context Assumption Check 보강은 Source of Truth 문서와 검증 문서, report에 반영됐다. 무관한 frontend/data-integration 변경은 제외하고 `/tmp/nmm-context-pr` clean worktree의 `docs/harness-context-sufficiency-guidance` branch로 PR 범위를 분리했다.

## Recommended Next Action / 권장 다음 행동

- PR 생성 후 Pre-PR Human Checkpoint로 멈춘다.
- Reason: 분리된 PR 범위에서 validation과 harness regression이 통과했고, merge/finalize/cleanup은 사람 확인이 필요하다.

## Options / 선택지

1. PR 생성 후 review를 기다린다.
2. wording을 추가 수정한다.
3. 원래 checkout의 `data-integration-*` workspace를 별도 정리한다.
4. 로컬 보류한다.

## PR Scope Draft / PR 범위 초안

Include for Context Assumption Check:

- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/09-collaboration-agreement.md`
- `docs/10-next-action-menu.md`
- `docs/13-human-command-flow.md`
- `docs/15-context-budget-rule.md`
- `docs/reports/README.md`
- `docs/reports/context-assumption-check.md`
- `docs/workflows/docs/harness-context-sufficiency-guidance/`

Exclude unless the human expands scope:

- `frontend/src/app/App.jsx`
- `docs/workflows/feature/data-integration-*/`
- `docs/08-development-workflow.md`의 Data Integration UX Rebuild Queue hunk

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "프롬프트를 반영해줘"라고 요청해 Context Assumption Check 문서 보강을 진행.

## Next AI Action / 다음 AI 행동

- option 1이면 PR review 대기, CI 확인, merge/finalize/cleanup 전 Pre-PR Human Checkpoint를 유지한다.
- option 2이면 관련 Source of Truth 문서와 report를 추가 수정한다.
- option 3이면 무관한 data-integration workspace의 quality/decision 상태를 해당 workspace 범위에서 정리한다.
- option 4이면 hold reason을 `notes.md`에 기록한다.
