# 하네스 객관 답변 경계 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-29
- Changed: `docs/reports/collaboration-harness-team-usage-guide.md`의 `AI는 원하는 답이 아니라 균형 잡힌 판단을 제시한다` 섹션에 AI 답변은 팀 합의나 승인이 아니라 판단 참고 자료라는 설명을 보강했다. FAQ와 팀원 체크리스트에도 AI 답변의 기준과 한계를 확인하는 문장을 연결했다.
- Verified: `rg`로 핵심 문구와 예시 반영 여부를 확인했다. `git diff --check`로 Markdown diff 공백 문제를 확인했다.
- Remaining: 운영자 승인이나 CODEOWNERS 같은 시스템 강제 규칙은 이번 Phase 범위가 아니다.
- Next context: 팀원이 AI 답변을 팀 근거로 사용하려 할 때는 어떤 문서와 현재 상태를 기준으로 한 답변인지, 설명/추천/승인 중 무엇인지 구분해야 한다.
- Risk: 문서 안내 수준의 보강이므로 실제 GitHub 승인 강제나 AI 답변 강제는 별도 시스템/운영 규칙 보강이 필요하다.
