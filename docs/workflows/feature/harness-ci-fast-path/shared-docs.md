# 하네스 CI Fast Path와 Local Complete Gate 보강 공유 문서 변경 제안

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | CI/CD 품질 게이트 요약을 fast/conditional strict 기준으로 정렬 | Development Operations 요약 drift 방지 | 낮음 |
| `docs/08-development-workflow.md` | Fast Path와 Local Complete Gate 추가 | 작은 변경의 운영 비용 감소 | 중간 |
| `docs/10-next-action-menu.md` | Fast Path, Local Complete, CI heavy/skip 메뉴 추가 | 사람 선택지를 열린 질문 대신 상태 기반으로 제시 | 낮음 |
| `docs/12-quality-gates.md` | Fast CI, Conditional Heavy Gate, required check/aggregator 전략 추가 | CI/CD 병목 완화 정책의 Source of Truth | 중간 |
| `docs/15-context-budget-rule.md` | Fast Path Read 추가 | 작은 변경의 문맥 로딩 비용 감소 | 낮음 |
| `docs/18-harness-regression-policy.md` | `scripts/test-harness.sh` 조건부 실행 기준 명시 | CI path filter와 harness regression rule 정렬 | 중간 |
| `docs/system-guardrails.md` | required check 인벤토리를 path-filter heavy gate 설계와 정렬 | 실제 시스템 가드레일 설명 drift 방지 | 중간 |

## Integration Notes / 통합 메모

- 기존 required context 이름은 유지한다.
- `ci-status` aggregator는 추가하지만 branch protection required context 변경은 사람 확인 뒤에만 가능하다.

## Conflicts To Resolve / 해결할 충돌

- none known
