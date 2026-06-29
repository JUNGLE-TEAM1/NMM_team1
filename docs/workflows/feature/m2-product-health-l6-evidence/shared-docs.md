# M2 Product Health 실제 L6 실행 증거 생성 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | `product_health_l6_gold_preview_smoke`의 범위와 M3 소유 metric 의미를 명시한다. | M2 smoke가 최종 `risk_score` semantics를 확정한 것으로 오해하지 않게 한다. | 낮음: 기존 계약에 additive 설명을 추가한다. |
| `docs/07-manual-verification-playbook.md` | 작은 Product Health L6 smoke 재실행 명령을 추가한다. | 5GB 실행 전에도 M2 실행 경로를 사람이 확인할 수 있어야 한다. | 낮음: manual verification 안내 추가다. |
| `contracts/runtime_config.sample.json` | `product_health_l6_gold_preview_smoke` sample을 추가한다. | M5/M6가 M2 L6 preview evidence 입력과 SQL smoke 모양을 확인할 수 있게 한다. | 낮음: 새 sample key 추가이며 기존 key는 유지한다. |

## Integration Notes / 통합 메모

- 이번 smoke는 `review_count`, `average_rating`만 생성한다.
- `negative_review_rate`, `conversion_rate`, `late_delivery_rate`, `risk_score` 최종 의미와 Catalog schema는 M3/M5 후속 작업에서 닫아야 한다.
- 5GB evidence는 이 smoke와 같은 runner/result shape를 사용하되 입력 묶음이 준비된 뒤 별도 Phase로 실행한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
