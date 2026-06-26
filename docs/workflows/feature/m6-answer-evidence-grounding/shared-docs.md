# M6 answer evidence grounding 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | component boundary 변경 없이 M6 응답 grounding만 보강한다. | 낮음 |
| `docs/03-interface-reference.md` | `AIQueryResult.evidence` optional grounding fields 설명 추가 | M1이 schema/metric/lineage/retrieval evidence를 소비할 수 있게 contract reference를 맞춘다. | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | 기존 R5 Ask/Evidence 기준에 연결되며 새 수용 항목은 만들지 않는다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | "Evidence 없는 AI 답변" guard를 기존 기준으로 확인한다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | 기존 Ask/Evidence 점검의 SQL, dataset, metric, freshness, lineage evidence 확인으로 충분하다. | 낮음 |

## Integration Notes / 통합 메모

- `contracts/ai_query_result.sample.json`은 Source of Truth는 아니지만 M1/M6 fixture contract이므로 함께 갱신한다.

## Conflicts To Resolve / 해결할 충돌

- API response에 optional field를 추가하므로 기존 M1 소비자가 기존 필드만 읽는 경우 깨지지 않아야 한다.
