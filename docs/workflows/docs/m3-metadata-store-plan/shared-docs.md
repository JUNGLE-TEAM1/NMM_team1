# M3 metadata store plan 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/01-product-planning.md` | M3 scope and open decisions updated | M3 should start with a clear source/store/API plan | 낮음 |
| `docs/02-architecture.md` | SQLite + replaceable `MetadataStore` boundary added | Future PostgreSQL/MongoDB migration needs an explicit backend boundary | 중간: future implementation must honor this boundary |
| `docs/03-interface-reference.md` | M3 source/catalog API contract and exclusions added | Frontend/backend can split work without guessing contracts | 중간: exact response fields may evolve during implementation |
| `docs/05-acceptance-scenarios-and-checklist.md` | M3 acceptance criteria added | Completion gate must match the clarified M3 plan | 낮음 |
| `docs/08-development-workflow.md` | M3 milestone signal updated | Phase queue should point to the clarified M3 completion signal | 낮음 |

## Integration Notes / 통합 메모

- M3 implementation branch should read this workspace before coding.
- M3 must keep PostgreSQL/MongoDB as future implementations, not MVP blockers.

## Conflicts To Resolve / 해결할 충돌

- 없음
