# M6 OpenAI LLM Adapter 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | M6 LLM adapter boundary를 `OpenAILLMAdapter` env-gated provider와 env contract로 보강 | `Settings`/provider 선택 계약이 생겼고 secret-safe prompt boundary를 공유해야 한다. | 낮음. 기존 `AIQueryResult` public field는 유지한다. |
| `docs/05-acceptance-scenarios-and-checklist.md` | OpenAI adapter opt-in, key 부재/provider 오류 fallback, unsafe prompt material 금지 acceptance 추가 | 외부 provider를 붙여도 Week 2 기본 smoke와 M1 소비 계약이 깨지지 않아야 한다. | 낮음. additive criteria다. |
| `docs/06-regression-and-failure-scenarios.md` | M6 LLM adapter failure scenario에 OpenAI key/provider 오류/fallback/request body safety를 추가 | secret-backed provider가 들어와도 blocked/unsupported/no-secret 경계를 보호한다. | 낮음. 기존 guard를 확장한다. |
| `docs/07-manual-verification-playbook.md` | 실제 key 없이 provider gate/fallback을 확인하는 M6 OpenAI 점검 섹션 추가 | 사용자가 key를 나중에 채우는 흐름에서도 수동 검증 기준이 필요하다. | 낮음. live call은 optional 후속 smoke로 둔다. |

## Integration Notes / 통합 메모

- `contracts/*.sample.json`은 변경하지 않았다. public `AIQueryResult` schema는 그대로 유지된다.
- M1/M5/M6 owner boundary는 유지된다. M6는 답변 생성 adapter만 소유한다.
- `docs/02-architecture.md`는 변경하지 않았다. module ownership, service boundary, public architecture가 바뀌지 않았기 때문이다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
