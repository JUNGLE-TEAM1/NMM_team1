# M6 M5 CatalogSource adapter 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | 이번 작업은 기존 M6 `CatalogSource` adapter 경계 안에서 M5 store source만 추가한다. | low |
| `docs/03-interface-reference.md` | 변경 없음 | `AIQueryResult`, `CatalogMetadata`, route contract를 바꾸지 않았다. | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | 기존 Query/Ask evidence acceptance를 route test로 충족한다. | low |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | 기존 evidence 없는 AI 답변/Week2 contract regression guard 안에서 검증한다. | low |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | manual path는 기존 Ask/Evidence 기준을 자동 route test로 대체 확인했다. | low |

## Integration Notes / 통합 메모

- M6는 `Week2CatalogStoreSource`를 통해 M5 `Week2CatalogStore.load_catalog()` 결과를 먼저 읽고, 저장된 catalog가 없을 때만 fixture fallback을 사용한다.
- M5 workflow service와 M6 AI query service가 같은 Week 2 catalog store root를 사용하도록 container에서 `Week2CatalogStore`를 공유한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
