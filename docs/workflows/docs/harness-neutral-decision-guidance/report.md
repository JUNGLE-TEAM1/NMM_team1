# Harness neutral decision guidance 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/harness-neutral-decision-guidance`, `docs/workflows/docs/harness-neutral-decision-guidance`
- Date: 2026-06-29
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/reports/collaboration-harness-team-usage-guide.md`, `docs/reports/README.md`, `docs/workflows/docs/harness-neutral-decision-guidance/plan.md`
- Escalated context read: not needed
- Context omitted intentionally: runtime code internals, unrelated reports, unrelated branch workspaces
- Changed: 팀원용 사용 가이드에 AI가 질문자의 원하는 결론을 맞춰주는 방식으로 답하지 않도록 하는 중립적 판단 기준을 추가했다. 판단 질문에는 문서 기준/현재 상태 구분, 반대 관점, 장점, 리스크, 보완책, 추천도, 신뢰도, 사람 확인 지점을 함께 제시하도록 했고, 기본 3축(기준/리스크/책임)과 상황별 보조 축(시간/팀 영향/계약/검증/운영/감정·불안)을 질문 성격에 따라 선택하도록 보강했다. AI 답변을 최종 권위로 쓰지 않으며 제안자는 다른 팀원의 시간/스코프/리뷰/검증 부담과 감정적 비용을 함께 설명해야 함을 FAQ/checklist에 보강했다.
- Verified: `rg`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR 리뷰에서 표현 강도와 실제 운영 예시가 적절한지 확인할 수 있다.
- Next context: 새 판단 질문 기준은 기존 온보딩 guide 위에 얹는 보강이다. scope 확장, merge, 검증 생략, interface 변경, 배포 질문에는 "AI가 괜찮다고 했다"가 아니라 기본 3축과 필요한 보조 축, 추천도/신뢰도/반대 관점/팀 영향/보완책/사람 확인 지점이 함께 있는지 확인한다.
- Risk: 문서-only 변경이며 Source of Truth 규칙, PR merge 정책, runtime guardrail 자체를 바꾸지 않는다.
