# Harness objective answer guidance 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `codex/docs/harness-objective-answer-guidance-v2`, `docs/workflows/docs/harness-objective-answer-guidance`
- Date: 2026-06-29
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/reports/collaboration-harness-team-usage-guide.md`, `docs/reports/README.md`
- Escalated context read: none
- Context omitted intentionally: 제품/API/schema/구현 코드 문맥은 이번 문서 표현 보강 범위가 아니므로 생략
- Changed: 사용가이드의 AI 답변 중립성 섹션에 AI 답변은 판단 참고 자료이고 팀 합의/승인이 아니라는 설명, 짧은 답변 예시, 팀 근거로 사용할 때 확인할 기준을 보강했다. FAQ와 체크리스트에도 설명/추천/승인 구분을 연결했다.
- Verified: `rg` 문구 확인과 `git diff --check` 통과
- Remaining: 실제 시스템 강제 설정은 이번 범위에서 제외했다.
- Next context: 하네스 질문 답변은 이 사용가이드를 기준 문맥으로 삼되, 실제 판단은 저장소/PR/CI/workspace 상태 확인과 사람 결정을 분리해야 한다.
- Risk: 문서 기반 안내이므로 AI나 GitHub의 강제 동작을 보장하지 않는다.
