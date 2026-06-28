# Harness neutral decision guidance 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-29
- Changed: `AskLake 협업 하네스 사용 가이드`에 AI가 질문자의 원하는 결론을 맞춰주는 방식으로 답하지 않고, 문서 기준과 현재 상태를 나눈 뒤 반대 관점, 장점, 리스크, 보완책, 추천도, 신뢰도, 사람 확인 지점을 함께 제시해야 한다는 판단 질문 기준을 추가했다. 또한 기본 3축(기준/리스크/책임)과 상황별 보조 축(시간/팀 영향/계약/검증/운영/감정·불안)을 구분해, AI가 모든 질문에 모든 축을 기계적으로 적용하지 않고 질문 성격에 맞는 축을 선택하도록 보강했다. AI 답변은 최종 권위가 아니며, 그 제안을 팀에 가져가 실행하자고 말하는 사람은 팀원 본인이라는 제안자 책임과 협업 감정 비용 기준을 FAQ/checklist에 보강했다.
- Verified: `rg`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: 팀 리뷰에서 표현 강도와 실제 운영 예시가 적절한지 확인할 수 있다.
- Next context: 하네스 관련 판단 질문은 "AI가 내 편을 들어줬다"가 아니라 "팀이 판단할 재료가 균형 있게 정리됐다"를 기준으로 본다. 기본 3축은 항상 적용하되, scope 확장, merge, 검증 생략, interface 변경, 배포처럼 팀 영향이 큰 질문에는 시간, 팀 영향, 계약, 검증, 운영, 감정/불안 축 중 필요한 축을 함께 확인한다.
- Risk: 이 변경은 협업 guide 보강이며 Source of Truth 규칙, PR merge 정책, runtime guardrail 자체를 변경하지 않는다.
