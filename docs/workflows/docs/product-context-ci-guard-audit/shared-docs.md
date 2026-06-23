# Product context CI guard audit 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/reports/product-context-coherence-audit.md` | Added audit evidence report for product context guard | 문맥 검사 결과와 CI 포함 판단을 evidence로 남김 | Low |
| `docs/reports/README.md` | Added latest report index entry | 다음 작업자가 product context audit을 찾을 수 있게 함 | Low |
| `scripts/validate-harness.sh` | Added product context strict guard | current baseline/Target MVP drift를 CI-safe하게 감지 | Medium |
| `scripts/test-harness.sh` | Added negative fixture for missing trust loop | validation guard 회귀를 방지 | Low |

## Integration Notes / 통합 메모

- Source of Truth 문서 자체는 현재 기준과 일치하므로 직접 수정하지 않았다.
- Evidence/report와 validation/test script만 변경했다.

## Conflicts To Resolve / 해결할 충돌

- Historical report에는 과거 `--auto-pr` remaining이나 경량 MVP 표현이 남을 수 있다. 이는 Source of Truth가 아니라 evidence로 취급한다.
