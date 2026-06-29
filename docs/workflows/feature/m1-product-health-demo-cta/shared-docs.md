# M1 product health demo CTA 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/reports/m1-product-health-demo-cta.md` | Phase 실행 증거 report 추가 | 이번 작업은 M6 SQL planner intent 계약을 새로 정의하지 않고 M1 `/query` 화면에서 Product Health/unsupported/legacy 질문 CTA를 표시하는 UI 보강만 수행했다. Source of Truth 변경은 없고 증거 계층만 추가한다. | 낮음. durable report 추가이며 공유 contract 변경 없음. |

## Integration Notes / 통합 메모

- `docs/05`, `docs/06`, `docs/07`의 M6 route/unsupported/query evidence 기준을 구현 범위 판단에 사용했다.

## Conflicts To Resolve / 해결할 충돌

- 없음
