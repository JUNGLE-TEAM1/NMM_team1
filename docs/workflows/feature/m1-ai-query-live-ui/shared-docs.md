# M1 AI Query Live UI 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | none | M1 UI가 기존 M6 API를 소비하는 구현 변경이다. | low |
| `docs/03-interface-reference.md` | none | `AIQueryResult.query_result`와 `evidence[]` grounding 계약은 이미 Source of Truth에 반영되어 있다. | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | none | existing acceptance의 Ask evidence 연결을 구현으로 충족한다. | low |
| `docs/06-regression-and-failure-scenarios.md` | none | Ask 결과 evidence/보류 사유 표시 guard를 유지한다. | low |
| `docs/07-manual-verification-playbook.md` | none | 기존 Week 2 verification 항목으로 확인 가능하다. | low |

## Integration Notes / 통합 메모

- 공유 계약 변경 없이 `frontend/src/app/App.jsx`와 `frontend/src/app/styles.css`에서 소비 UI만 갱신했다.

## Conflicts To Resolve / 해결할 충돌

- none
