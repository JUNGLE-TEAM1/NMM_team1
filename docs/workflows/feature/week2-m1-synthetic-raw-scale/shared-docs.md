# Week2 M1 synthetic raw demo sample scale 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | none | runtime architecture 변경 없음 | 낮음 |
| `docs/03-interface-reference.md` | none | M3 계약 6필드와 기존 Week 2 Contract Package를 그대로 소비한다 | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | none | 기존 Week 2 fixture/contract acceptance를 확인했다 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | none | fixture contract 없이 구현 시작 금지 guard를 확인했다 | 낮음 |
| `docs/07-manual-verification-playbook.md` | none | 기존 Week 2 fixture/manual verification 항목과 local runner smoke로 충분하다 | 낮음 |

## Integration Notes / 통합 메모

- M3 handoff 때 10,000행 minimum-start와 100,000행 demo_sample 중 어떤 파일을 Bronze 변환기에 넣을지 명확히 구분해야 한다. 현재 worktree의 `data/week2/mvp_synthesis/...`는 scale sample로 덮어쓴 상태다.

## Conflicts To Resolve / 해결할 충돌

- none
