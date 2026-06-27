# Week2 M1 delivery location enrichment 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | none | delivery seed role remains auxiliary synthetic dataset; no architecture boundary change | 낮음 |
| `docs/03-interface-reference.md` | deferred | location-enriched delivery shape may become M5/M6 contract after consumption query is implemented | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | none | this Phase validates local generator output only | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | none | focused unit and generated-data validation cover location preservation | 낮음 |
| `docs/07-manual-verification-playbook.md` | none | repeatable commands are recorded in workspace evidence and handoff | 낮음 |

## Integration Notes / 통합 메모

- PR #180 delivery seed generator is enhanced, not replaced.
- Generated `data/` remains ignored.
- M5/M6 consumer should treat borough/zone fields as synthetic auxiliary analysis dimensions, not real delivery operations geography.

## Conflicts To Resolve / 해결할 충돌

- none
