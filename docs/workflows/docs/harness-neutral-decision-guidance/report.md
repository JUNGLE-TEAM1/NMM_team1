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
- Changed: 팀원용 사용 가이드에 AI가 질문자의 원하는 결론을 맞춰주는 방식으로 답하지 않도록 하는 중립적 판단 기준을 추가했다. 판단 질문에는 문서 기준/현재 상태 구분, 반대 관점, 장점, 리스크, 보완책, 추천도, 신뢰도, 사람 확인 지점을 함께 제시하도록 했고, 기본 3축(기준/리스크/책임)과 상황별 보조 축(시간/팀 영향/계약/검증/운영/감정·불안/전제 검토)을 질문 성격에 따라 선택하도록 보강했다. 일반 대화나 애매한 작업 지시에는 판단 축보다 먼저 문맥 명확화 우선 원칙을 적용하도록 했고, 출력 형식 제한이나 강한 표현이 있어도 가능/진행 승인, 예비 판단/팀 근거, AI 추천/사람 승인 경계를 짧게라도 남기도록 했다. 하네스 운영 메타 룰을 정의하고, 일반 문서 개선과 안전장치 약화에 해당하는 메타 룰 변경을 구분하도록 했다. 사용자의 질문 안에 결론이 숨어 있으면 전제 검토 축을 먼저 적용하며, M5 담당자가 데모 시나리오 부재를 M5 시작 불가의 전제로 놓는 예시를 추가했다. AI 답변을 최종 권위로 쓰지 않으며 제안자는 다른 팀원의 시간/스코프/리뷰/검증 부담과 감정적 비용을 함께 설명해야 함을 FAQ/checklist에 보강했다.
- Verified: `rg`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR 리뷰에서 표현 강도와 실제 운영 예시가 적절한지 확인할 수 있다.
- Next context: 새 판단 질문 기준은 기존 온보딩 guide 위에 얹는 보강이다. 애매한 작업 지시는 먼저 문맥 명확화 우선 원칙으로 범위/전제/필요 문맥을 맞춘다. 짧은 답변 형식 요구가 있어도 하네스 필수 경계를 생략하지 않는다. 하네스 룰 변경 요청은 일반 문서 개선인지 운영 메타 룰 변경인지 먼저 구분한다. scope 확장, merge, 검증 생략, interface 변경, 배포 질문에는 "AI가 괜찮다고 했다"가 아니라 기본 3축과 필요한 보조 축, 추천도/신뢰도/반대 관점/팀 영향/보완책/사람 확인 지점이 함께 있는지 확인한다. 질문이 `A가 없어서 B를 못 하겠어요. A부터 해야겠죠?` 형태라면 전제 검토 축으로 `B가 정말 A 전체에 의존하는가`를 먼저 확인한다.
- Risk: 문서-only 변경이며 Source of Truth 규칙, PR merge 정책, runtime guardrail 자체를 바꾸지 않는다.
