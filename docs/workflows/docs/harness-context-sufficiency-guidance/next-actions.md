# Harness context sufficiency guidance 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete pending PR/sync decision
- Summary: Context Assumption Check 보강은 Source of Truth 문서와 검증 문서, report에 반영됐다. Workspace 자체는 PR checklist ready이지만 현재 checkout branch가 `feature/data-integration-screen-reset`이고 무관한 frontend/data-integration 변경이 섞여 있어 PR 전 범위 분리가 필요하다.

## Recommended Next Action / 권장 다음 행동

- Pre-PR Human Checkpoint 전에 포함/제외 파일과 branch/sync 방향을 확인한다.
- Reason: 문서 변경은 완료됐지만 현재 branch/worktree가 Context Assumption Check workspace와 맞지 않고, `data-integration-*` 변경이 strict/test fixture를 깨고 있다.

## Options / 선택지

1. Context Assumption Check 파일만 분리해 PR 준비를 계속한다.
2. `data-integration-*` workspace 상태를 먼저 정리한 뒤 strict/test를 재실행한다.
3. wording을 추가 수정한다.
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

Needs split or human decision:

- `docs/08-development-workflow.md`: contains both Context Assumption Check hunks and unrelated Data Integration UX Rebuild Queue hunks.

Exclude unless the human expands scope:

- `frontend/src/app/App.jsx`
- `docs/workflows/feature/data-integration-*/`

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "프롬프트를 반영해줘"라고 요청해 Context Assumption Check 문서 보강을 진행.

## Next AI Action / 다음 AI 행동

- option 1이면 `docs/08` hunk split 전략을 확인하고, 사람 승인 후에만 branch 전환/sync/PR 준비를 검토한다.
- option 2이면 무관한 data-integration workspace의 quality/decision 상태를 해당 workspace 범위에서 정리한다.
- option 3이면 관련 Source of Truth 문서와 report를 추가 수정한다.
- option 4이면 hold reason을 `notes.md`에 기록한다.
