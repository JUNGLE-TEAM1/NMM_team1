# Week2 M1 synthetic raw demo data 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | none | runtime architecture를 바꾸지 않고 local seed 생성 스크립트만 추가한다. | 낮음 |
| `docs/03-interface-reference.md` | none | 기존 Week 2 Contract Package와 `contracts/*.sample.json`을 소비하며 contract를 변경하지 않는다. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | none | Week 2 contract fixture 확인 항목을 그대로 사용한다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | none | Week 2 fixture contract 없이 구현 시작 금지 guard를 확인했고 새 guard는 추가하지 않는다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | none | 기존 Week 2 fixture/manual verification 항목과 local runner smoke로 충분하다. | 낮음 |

## Integration Notes / 통합 메모

- M3 handoff 시 `reviews_seed.jsonl` path, sample 3줄, `source_manifest.json`, `raw_demo_summary.json`, known limitation을 전달한다.
- `.milestones/week2-demo/` manifest는 아직 만들지 않았다. 이번 작업은 독립 M1 data seed Phase라 branch workspace로 충분하다고 판단했다.

## Conflicts To Resolve / 해결할 충돌

- none
