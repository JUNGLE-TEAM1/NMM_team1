# Harness context sufficiency guidance 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/harness-context-sufficiency-guidance`, `docs/workflows/docs/harness-context-sufficiency-guidance`
- Date: 2026-06-29
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/reports/collaboration-harness-team-usage-guide.md`
- Escalated context read: none
- Context omitted intentionally: 제품/API/schema/구현 코드 문맥은 이번 문서 표현 보강 범위가 아니므로 생략
- Changed: 작업 문맥은 AI가 초안을 만들 수 있고, 사람은 그 문맥을 이해한 뒤 충분성을 확인한다는 책임 경계를 사용가이드에 보강했다. 추가로 하네스가 책임을 새로 만드는 것이 아니라 원래 있던 협업 책임을 AI 도움으로 더 쉽게 다하게 해주는 장치라는 설명을 3장과 7장에 보강했다. 문서 앞부분에는 처음 읽는 경로를 추가했고, 6.6은 핵심 원칙을 먼저 보여준 뒤 상세 기준으로 이어지게 정리했다. FAQ의 강한 표현도 팀 근거 확인 톤으로 순화했다.
- Follow-up changed: 질문/명령에 답하기 전 AI가 일반론, 저장소 규칙, 비교 답변, 실행 요청, 정책 결정, 고영향 행동 여부를 먼저 판별하는 `Context Assumption Check`를 협업 합의, 사람 명령 흐름, Phase 시작 gate, Context Budget 관계, Next Action Menu, acceptance/regression/manual verification에 반영했다.
- Verified: `rg` 문구 확인, 책임 부담 완화 문구 확인, 읽기 흐름/톤 보강 문구 확인, Context Assumption Check 문구 확인, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/test-harness.sh` 통과. `scripts/test-harness.sh`는 clean PR worktree `/tmp/nmm-context-pr`에서 `Harness regression tests passed: 31`을 반환했다.
- Remaining: PR 생성 후 merge/finalize/cleanup은 Pre-PR Human Checkpoint에서 사람 확인이 필요하다.
- Next context: 팀원에게는 직접 모든 문맥을 쓰라는 뜻이 아니라, AI 도움을 받아 만든 문맥이 자기 스코프/의도/팀 기준에 맞는지 확인하라는 의미로 설명한다. 책임 설명은 추가 부담이 아니라 원래 협업 책임을 더 쉽게 수행하는 방법으로 읽히게 한다. 개념 질문도 먼저 적용 렌즈를 내부 판별하되, 단순 설명은 불필요하게 막지 않고 `일반론 기준 / 이 저장소 기준`을 나누어 답한다.
- Risk: 문서 규칙 보강이며 시스템 강제 동작은 바뀌지 않는다. 원래 checkout의 `frontend/src/app/App.jsx`, `docs/workflows/feature/data-integration-*/`, `docs/08` Data Integration queue hunk는 이 PR에서 제외했다.
