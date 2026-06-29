# Context Assumption Check 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/harness-context-sufficiency-guidance`, `docs/workflows/docs/harness-context-sufficiency-guidance`
- Date: 2026-06-29
- Workspace state: complete
- Context Budget mode: Lite Read -> targeted Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/09-collaboration-agreement.md`, `docs/13-human-command-flow.md`, `docs/08-development-workflow.md`, `docs/15-context-budget-rule.md`, `docs/10-next-action-menu.md`
- Escalated context read: `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/reports/_template.md`, `docs/reports/README.md`, `docs/workflows/docs/harness-context-sufficiency-guidance/*`
- Context omitted intentionally: 제품/API/schema/구현 코드는 이번 협업 하네스 문서 규칙 변경 범위가 아니므로 생략
- Changed: 질문/명령에 답하기 전 AI가 일반론, 저장소 규칙, 비교 답변, 실행 요청, 정책 결정, 고영향 행동 여부를 먼저 판별하는 `Context Assumption Check`를 협업 합의, 사람 명령 흐름, Phase 시작 gate, Context Budget 관계, Next Action Menu, acceptance/regression/manual verification에 반영했다.
- Verified: `rg` 문구 확인, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/test-harness.sh` 통과. `scripts/test-harness.sh`는 clean PR worktree `/tmp/nmm-context-pr`에서 `Harness regression tests passed: 31`을 반환했다.
- Remaining: PR 생성 후 merge/finalize/cleanup은 Pre-PR Human Checkpoint에서 사람 확인이 필요하다. 원래 checkout의 `data-integration-*` 미추적 workspace는 이번 범위 밖이라 수정하지 않았다.
- Next context: 개념 설명도 먼저 적용 렌즈를 내부 판별한다. 다만 단순 개념 질문은 불필요하게 되묻지 않고, 답이 달라지는 경우 `일반론 기준 / 이 저장소 기준`으로 나누어 답한다. repository 상태 변경이나 PR/merge/finalize/cleanup 같은 고영향 행동은 matching confirmation gate로 보낸다.
- Risk: 문서 규칙 변경이며 시스템 강제 로직은 바뀌지 않는다. 원래 checkout의 `frontend/src/app/App.jsx`, `docs/workflows/feature/data-integration-*/`, `docs/08` Data Integration queue hunk는 이 PR에서 제외했다.
