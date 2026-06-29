# M6 LLM Answer Adapter 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | 기존 M6 Ask/Evidence boundary 안의 adapter 추가라 architecture layer 변경은 아니다. | 낮음 |
| `docs/03-interface-reference.md` | `LLMAdapter`/`LLMAnswerContext` 허용/금지 입력 경계 추가 | 외부 provider를 붙이기 전 안전한 prompt/context 계약을 고정한다. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | M6 답변 생성 adapter 수용 기준 추가 | Week 2 기본값이 외부 호출 없는 template adapter임을 확인한다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | unsafe LLM context/external call 회귀 시나리오 추가 | local path, secret, blocked answer provider call 누출을 막는다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | 기존 M6 route/manual 흐름과 `docs/06` failure scenario, backend regression으로 unsupported/no external provider behavior를 검증한다. PR size hard gate를 넘기지 않기 위해 별도 manual step 추가는 보류한다. | 낮음 |

## Integration Notes / 통합 메모

- Public response shape는 additive 변경도 없이 유지한다. `AIQueryResult.summary` 문자열 생성 책임만 adapter 경계 뒤로 이동했다.

## Conflicts To Resolve / 해결할 충돌

- 현재 충돌 없음.
