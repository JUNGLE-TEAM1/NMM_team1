# AskLake week 2 shared contract hardening 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | architecture boundary는 기존 R0.5/R0.6 기준 유지 | 낮음 |
| `docs/03-interface-reference.md` | Week 2 route, ID, storage path, `QueryResult`, guardrail, run status, smoke evidence 계약 추가 | 모듈별 구현 전 공통 경계를 고정하기 위해 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Shared Contract Hardening acceptance checkpoint 추가 | M1~M6 구현 전 공통 계약 확인 기준 연결 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | hardening 없이 구현 시작하는 실패 시나리오 추가 | endpoint/status/result/path drift 방지 | 낮음 |
| `docs/07-manual-verification-playbook.md` | hardening 수동 확인 항목 추가 | fixture와 `docs/03`의 실제 일치 확인 | 낮음 |

## Integration Notes / 통합 메모

- `contracts/*.sample.json`은 여전히 최종 storage schema가 아니라 Week 2 구현 전 fixture package다.
- `AIQueryResult.query_result`가 canonical SQL execution result이고 top-level `sql`/`rows`는 M1 display convenience로 유지한다.

## Conflicts To Resolve / 해결할 충돌

- 없음. 기존 Week 2 contract setup의 TODO 값을 실제 구현값으로 확정하지 않고 shape만 보강했다.
