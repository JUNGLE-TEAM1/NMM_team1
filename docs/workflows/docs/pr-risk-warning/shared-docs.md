# PR risk warning 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/system-guardrails.md` | `PR size/risk warning`을 `planned`에서 repo-local warning 적용 상태로 갱신 | guardrail inventory가 실제 적용 상태를 반영해야 한다. | low |
| `.github/workflows/ci.yml` | focused test를 harness job에 추가 | warning 로직 회귀를 기존 CI에서 확인한다. | low |
| `.github/workflows/pr-risk-warning.yml` | PR risk warning workflow 추가 | PR 크기/위험 경로를 시스템이 advisory warning으로 감지한다. | low |
| `.github/scripts/check-pr-risk.js` | PR diff risk 계산 로직 추가 | threshold와 risky path 판정을 재사용 가능한 script로 둔다. | low |
| `tests/pr-risk-warning.test.js` | focused test 추가 | warning 경계 조건을 고정한다. | low |

## Integration Notes / 통합 메모

- hard gate와 override label은 후속 결정으로 남긴다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
