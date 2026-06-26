# M6 CatalogSource 경계 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | 이번 작업은 M6 내부 adapter 경계 추가이며 기존 Week2 architecture 범위 안에 있다. | low |
| `docs/03-interface-reference.md` | 변경 없음 | `AIQueryResult`, `CatalogMetadata`, route contract를 바꾸지 않았다. | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | 기존 Week2 M6 acceptance를 코드 검증으로 충족한다. | low |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | SQL guardrail과 fixture demo path가 유지된다. | low |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | manual path는 기존 Week2 route/service smoke로 충분하다. | low |

## Integration Notes / 통합 메모

- M5가 실제 Catalog source를 제공하면 `CatalogSource` 구현체만 추가 또는 교체하는 방식으로 통합한다.
- 이번 branch는 `contracts/*.sample.json`을 수정하지 않는다.
- `FixtureCatalogSource`는 현재 fixture demo path를 위한 default adapter이며, 장기 storage 선택을 뜻하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
