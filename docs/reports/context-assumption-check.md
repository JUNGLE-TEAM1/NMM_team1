# Context Assumption Check 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `codex/docs/harness-context-sufficiency-guidance`, `docs/workflows/docs/harness-context-sufficiency-guidance`
- Date: 2026-06-29
- Workspace state: complete
- Context Budget mode: Lite Read -> targeted Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/09-collaboration-agreement.md`, `docs/13-human-command-flow.md`, `docs/08-development-workflow.md`, `docs/15-context-budget-rule.md`, `docs/10-next-action-menu.md`
- Escalated context read: `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/reports/_template.md`, `docs/reports/README.md`, `docs/workflows/docs/harness-context-sufficiency-guidance/*`
- Context omitted intentionally: 제품/API/schema/구현 코드는 이번 협업 하네스 문서 규칙 변경 범위가 아니므로 생략
- Changed: 질문/명령에 답하기 전 AI가 일반론, 저장소 규칙, 비교 답변, 실행 요청, 정책 결정, 고영향 행동 여부를 먼저 판별하는 `Context Assumption Check`를 협업 합의, 사람 명령 흐름, Phase 시작 gate, Context Budget 관계, Next Action Menu, acceptance/regression/manual verification에 반영했다.
- Verified: `rg` 문구 확인, `git diff --check`, `scripts/validate-harness.sh` 통과. `scripts/validate-harness.sh --strict`는 unrelated untracked `docs/workflows/feature/data-integration-screen-reset/`의 invalid `Quality gate status: complete`와 Source of Truth proposal `Decision status: none` 때문에 실패했다. `scripts/test-harness.sh`는 첫 fixture `valid complete workspace passes`에서 같은 unrelated untracked workspace strict issue 때문에 실패했다.
- Remaining: 현재 checkout branch는 `feature/data-integration-screen-reset`이고 workspace expected branch는 `docs/harness-context-sufficiency-guidance`다. 자동 branch switch/pull/merge/rebase는 실행하지 않았다. PR 전 사람 확인 또는 별도 sync 판단이 필요하다. 또한 `data-integration-*` 미추적 workspace의 strict validation 상태는 이번 범위 밖이라 수정하지 않았다.
- Next context: 개념 설명도 먼저 적용 렌즈를 내부 판별한다. 다만 단순 개념 질문은 불필요하게 되묻지 않고, 답이 달라지는 경우 `일반론 기준 / 이 저장소 기준`으로 나누어 답한다. repository 상태 변경이나 PR/merge/finalize/cleanup 같은 고영향 행동은 matching confirmation gate로 보낸다.
- Risk: 문서 규칙 변경이며 시스템 강제 로직은 바뀌지 않는다. 기존 `docs/08-development-workflow.md`에는 다른 미커밋 Data Integration queue 변경이 함께 존재하고, 미추적 data-integration workspace가 strict/test fixture에 영향을 주므로 PR 범위 정리 때 포함/제외를 사람이 확인해야 한다. 기본 PR 전략은 Context Assumption Check 문서와 workspace/report만 포함하고, `frontend/src/app/App.jsx`와 `docs/workflows/feature/data-integration-*/`는 제외하는 것이다.
