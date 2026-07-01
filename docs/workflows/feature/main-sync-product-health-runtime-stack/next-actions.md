# Main AI Query Product Health Runtime Stack 다음 작업

## Recommended

1. C-48 설계 리뷰 후 후속 구현 Phase를 시작한다.
2. 구현 Phase 첫 단계는 domain contract + `QueryRouter` tests로 시작한다.
3. `AIQueryResult.evidence.storage` 유지와 LLM safe evidence 분리를 첫 회귀 테스트로 고정한다.
4. backend 계약 이식이 끝난 뒤 frontend AI Query trace/evidence UI를 부분 이식한다.

## Stop Conditions

- `origin/main` 전체 merge가 필요해지는 경우 사람 확인을 받는다.
- Product Health runtime catalog source가 fixture보다 뒤로 밀리는 경우 구현을 멈추고 계약을 재검토한다.
- 외부 LLM context에 local path나 secret 후보가 들어가는 경우 실패로 처리한다.
