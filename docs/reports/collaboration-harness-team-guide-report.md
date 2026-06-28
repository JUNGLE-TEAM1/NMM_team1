# 협업 하네스 팀 사용 가이드 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-28
- Changed: 팀원이 AskLake 협업 하네스를 실제 작업에서 사용할 수 있도록 `AskLake 협업 하네스 사용 가이드`를 추가하고, 처음 보는 사람도 빠르게 이해할 수 있는 `3분 요약`과 사람/AI 책임 구분을 보강했으며, branch workspace와 report index를 연결했다.
- Verified: `rg -n "AskLake 협업 하네스 사용 가이드|3분 요약|AI는 손과 기록 담당이다|하네스를 사용할 때 사람의 책임과 AI의 책임|AI는 책임을 대신 지지 않는다|Pre-PR Human Checkpoint|팀원이 기억할 최소 규칙" docs/reports/collaboration-harness-team-usage-guide.md docs/reports/README.md`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: 팀 리뷰 뒤 실제 팀 표현, 실습 예시, 발표 자료가 필요하면 후속 Phase로 보강한다.
- Next context: 팀원은 이 guide를 먼저 읽고 Phase 시작, mid-phase steering, 확인 gate, PR/merge 경계를 자연어 요청으로 다룬다.
- Risk: 이 문서는 Source of Truth 규칙 변경이 아니라 설명/온보딩 guide다. 공식 workflow 변경이 필요하면 별도 Source of Truth 전파 Phase가 필요하다.

---

## Phase

- Type: docs
- Branch/work location: `docs/collaboration-harness-team-guide`, `docs/workflows/docs/collaboration-harness-team-guide`
- Date: 2026-06-28
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/09-collaboration-agreement.md`
- `docs/10-next-action-menu.md`
- `docs/11-git-sync-policy.md`
- `docs/13-human-command-flow.md`
- 17주차 참고 양식: `AskLake/06_AskLake_MVP와_데모전략_학습.md`
- 17주차 참고 양식: `study/04-backend-control-security-observability-template.md`

## Goal / 목표

- 팀원들이 하네스의 작업 흐름, 사람/AI 책임 경계, 확인 게이트, PR/merge 경계, 문서 기록 방식을 이해해서 하네스 도입자 한 사람이 운영 부담을 혼자 지지 않도록 팀 공통 사용 가이드를 만든다.

## Changed Files / 변경 파일

- `docs/reports/collaboration-harness-team-usage-guide.md`
- `docs/reports/collaboration-harness-team-guide-report.md`
- `docs/reports/README.md`
- `docs/workflows/docs/collaboration-harness-team-guide/plan.md`
- `docs/workflows/docs/collaboration-harness-team-guide/notes.md`
- `docs/workflows/docs/collaboration-harness-team-guide/quality.md`
- `docs/workflows/docs/collaboration-harness-team-guide/sync.md`
- `docs/workflows/docs/collaboration-harness-team-guide/confirmations.md`
- `docs/workflows/docs/collaboration-harness-team-guide/decisions.md`
- `docs/workflows/docs/collaboration-harness-team-guide/shared-docs.md`
- `docs/workflows/docs/collaboration-harness-team-guide/next-actions.md`
- `docs/workflows/docs/collaboration-harness-team-guide/report.md`

## Implementation Summary / 구현 요약

- 기존 "도입자 책임 설명" 관점이 아니라 "팀원이 실제로 어떻게 요청하고 확인해야 하는지"를 중심으로 문서를 작성했다.
- 처음 보는 팀원도 앞부분만 읽고 핵심을 잡을 수 있도록 `3분 요약`과 안전한 요청/위험한 요청 예시를 추가했다.
- 하네스에서 사람은 작업 요청자이자 결정 승인자이고, AI는 작업 실행자이자 상태 기록자라는 책임 구분을 추가했다.
- `사람의 책임 / AI의 책임`, `사람이 확인해야 할 질문 / AI에게 시킬 수 있는 일`, `나쁜 응답 / 왜 위험한가 / 더 나은 응답` 표를 추가했다.
- Phase, branch workspace, Source of Truth, confirmation gate, PR 생성과 merge의 차이를 초보자용 문장으로 정리했다.
- `상황 / 팀원이 할 말 / AI가 하는 일`, `AI가 자동으로 할 수 있는 일 / 사람 확인이 필요한 일 / 이유`, `좋은 요청 / 애매한 요청 / 더 나은 표현`, `확인 게이트 / 언제 발생하는가 / 팀원이 결정할 것` 표를 포함했다.
- Phase 시작부터 PR 생성 뒤 Pre-PR Human Checkpoint까지 Mermaid 흐름도를 포함했다.
- 기존 `collaboration-harness-beginner-guide*`는 보존하고 새 팀원 사용 guide를 별도 파일로 추가했다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: default filesystem/git tooling, `apply_patch`
- Reason: Markdown 문서와 하네스 workspace evidence 작성 작업
- Impact: 특화 skill 없이 repo-local 문서 규칙과 하네스 validation을 따랐다.
- Not used because: 문서/PDF/PPTX 산출물이 아니라 Markdown guide 작성이다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/09-collaboration-agreement.md`, `docs/10-next-action-menu.md`, `docs/11-git-sync-policy.md`, `docs/13-human-command-flow.md`
- Escalated context read: 사용자 지정 17주차 양식 파일 2개
- Context omitted intentionally: runtime code internals, unrelated Week2 feature reports, unrelated branch workspaces

## Verification Commands / 검증 명령

```bash
rg -n "AskLake 협업 하네스 사용 가이드|3분 요약|AI는 손과 기록 담당이다|하네스를 사용할 때 사람의 책임과 AI의 책임|AI는 책임을 대신 지지 않는다|Pre-PR Human Checkpoint|팀원이 기억할 최소 규칙" docs/reports/collaboration-harness-team-usage-guide.md docs/reports/README.md
git diff --check
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/collaboration-harness-team-guide/quality.md`
- Quality gate status: passed
- TDD status: not applicable; docs-only learning guide
- CI/check result: local docs/harness validation passed
- Skipped checks: frontend/backend test/build skipped because runtime code did not change
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/collaboration-harness-team-guide/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: guide 위치는 `docs/reports/`, Source of Truth 정식 반영은 필요 시 후속 Phase로 보류
- Revisit/rollback condition: 팀이 guide를 공식 운영 규칙으로 승격하거나 별도 onboarding folder를 원할 때 이동/전파 Phase를 연다.

## Regression Guard / 회귀 보호

- Checked feature: 협업 하네스 설명/온보딩 guide
- Protected behavior: PR 생성과 merge/finalize/cleanup의 경계를 흐리지 않고, 사람 확인 gate를 팀원이 이해할 수 있게 유지한다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: 팀원이 `올려줘`, `진행해`, `알아서 해줘` 같은 애매한 요청으로 PR 생성과 merge 승인을 혼동하거나 AI가 책임을 대신 진다고 오해하는 상황
- Expected behavior: guide가 `PR만 올려줘`, `현재 PR 진행해`, `scope가 커지면 먼저 물어봐줘`, `검증 결과와 남은 위험을 보고 완료 처리해` 같은 더 나은 표현을 제시한다.
- Verification: 문서 내 요청 예시와 PR/merge 경계 섹션 확인
- Result: passed

## Manual Verification / 수동 검증

- Document executed: documentation review only
- Environment: local Markdown files
- Result: guide가 제목, 목차, 핵심 메시지, Mermaid 흐름도, 표, FAQ, 체크리스트를 포함한다.
- Failure/limitation: 실제 팀 온보딩 세션에서 이해도 테스트는 아직 수행하지 않았다.
- Evidence: `docs/reports/collaboration-harness-team-usage-guide.md`

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: documentation-only team collaboration guide
- Status: passed by local documentation review
- Evidence: guide artifact and harness validation

## Document Updates / 문서 업데이트

- Updated: `docs/reports/collaboration-harness-team-usage-guide.md`, `docs/reports/README.md`, branch workspace, Phase report
- Not updated and why: `docs/01`~`docs/13` Source of Truth 문서는 규칙/제품/API/검증 계약 변경이 아니므로 수정하지 않았다.

## Failed / Incomplete / Follow-Up TODO

- 팀 리뷰 뒤 구체 팀 사례, 실습 문제, 발표 자료가 필요하면 별도 Phase로 보강한다.

## Context For Next Phase / 다음 Phase 문맥

- 다음 Phase 후보: `협업 하네스 실습 체크리스트`, `팀 온보딩 발표 자료`, `PR/merge 요청 문장 cheat sheet`

## Secret / Migration / Env Check

- Secret check: no secrets added
- Migration/data change: none
- Env change: none

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: guide는 설명 문서라 실제 팀 적용 후 피드백에 따라 문구와 예시를 조정해야 할 수 있다.
