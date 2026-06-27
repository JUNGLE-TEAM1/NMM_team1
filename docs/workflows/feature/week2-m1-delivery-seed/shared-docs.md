# Week2 M1 delivery synthetic auxiliary seed 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | none | delivery seed는 M5/M6 auxiliary synthetic dataset으로 생성했으며 core architecture 변경은 없음 | 낮음 |
| `docs/03-interface-reference.md` | none | generated manifest/summary에 lineage/caveat를 기록했고 공유 interface 정식 계약화는 M5/M6 소비 확인 뒤 판단 | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | none | 이번 Phase는 local seed generator와 ignored generated data 검증으로 한정 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | none | focused unit test와 JSONL validation으로 source month/filter/lineage guard를 이 Phase 안에 둠 | 낮음 |
| `docs/07-manual-verification-playbook.md` | none | 반복 manual 절차는 PR 후 handoff 또는 소비 계약 Phase에서 정식 반영 판단 | 낮음 |

## Integration Notes / 통합 메모

- `delivery_trips_seed.jsonl`은 canonical auxiliary JSONL로 생성됐고, `delivery_trips_seed.parquet`은 Spark/M5/M6 convenience copy로 생성됐다.
- generated `data/`는 ignored 상태이며 PR에는 script/test/workspace evidence만 포함한다.

## Conflicts To Resolve / 해결할 충돌

- none
