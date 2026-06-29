# M6 Answer UX Metadata 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | `AIQueryResult.answer_metadata` UX handoff shape 추가 | M1이 summary text를 파싱하지 않고 provider/fallback/grounding state를 표시해야 한다. | 낮음. additive field다. |
| `docs/05-acceptance-scenarios-and-checklist.md` | answer metadata와 Ask 화면 표시 acceptance 추가 | UI/UX 기준을 수용 조건에 연결한다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | answer metadata/UI 신뢰 상태 mismatch failure scenario 추가 | blocked/fallback을 grounded answer처럼 보여주는 회귀를 막는다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | M1 `/query` metadata panel 확인 항목 추가 | desktop/mobile UI smoke 기준을 남긴다. | 낮음 |

## Integration Notes / 통합 메모

- `docs/02-architecture.md`는 변경하지 않았다. module ownership은 그대로이며 M6 response additive field와 M1 display만 바뀐다.
- `contracts/ai_query_result.sample.json`은 `answer_metadata` additive field를 포함하도록 갱신했다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
