# M6 Catalog retrieval scoring 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | M6 내부 retrieval scoring 분리이며 기존 Semantic/RAG-lite architecture 범위 안이다. | low |
| `docs/03-interface-reference.md` | 변경 없음 | `AIQueryResult`, `CatalogMetadata`, route contract를 바꾸지 않았다. | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | 기존 Week2 M6 acceptance를 테스트로 충족한다. | low |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | SQL guardrail과 fixture route behavior를 유지한다. | low |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | manual path는 기존 Week2 route/service smoke로 충분하다. | low |

## Integration Notes / 통합 메모

- `CatalogRetriever`는 `CatalogSource`에서 받은 catalog 목록만 소비한다.
- M5 real catalog source가 붙어도 `Week2AIQueryService`의 response contract는 유지한다.
- retrieval score는 API에 노출하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
