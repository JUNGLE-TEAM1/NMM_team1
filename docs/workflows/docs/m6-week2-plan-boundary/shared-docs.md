# M6 Week2 plan boundary update 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/project-context/asklake-week2-module-plan/ver2/README.md` | M6 SQL-first guardrail과 additive response/RAG-lite cache 경계를 요약한다. | 팀원이 먼저 읽는 Week2 ver2 요약과 세부 문서가 같은 기준을 말해야 한다. | 낮음. 문서 설명 보강이며 구현 계약은 기존 방향을 구체화한다. |
| `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md` | M6 하는 것/하지 않는 것, 10개 세부 slice, `AIQueryResult` additive field 경계를 추가한다. | M1~M5 소유권 충돌 없이 M6 다음 개발을 시작하기 위한 기준이다. | 낮음~중간. 후속 구현 순서와 interface 기대치를 더 명확히 한다. |
| `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md` | M6 SQL-first 발표 성공 조건, guardrail, 후속 slice 분할, 제외 범위를 보강한다. | 분석 대표 E2E path에서 M6가 SQL/RAG/LLM을 어떤 순서로 확장하는지 명확히 한다. | 낮음. 대표 path 범위를 좁히는 변경이다. |
| `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md` | 팀 handoff용 M6 내부 구현 순서와 branch 시작 조건을 추가한다. | 병렬 구현 중 M6가 M5 Catalog, M2 runtime, M1 UI 책임을 침범하지 않게 한다. | 낮음. handoff 설명 보강이다. |
| `docs/03-interface-reference.md` | SQL context source, missing local path blocked, future `route`/`retrieval_trace` additive field 조건을 명시한다. | M6 planning이 interface 경계에 영향을 주므로 최소 계약 설명을 맞춘다. | 중간. 후속 contract sample/schema PR에서 실제 필드 추가 여부를 확인해야 한다. |

## Integration Notes / 통합 메모

- 이번 branch는 구현 코드를 변경하지 않는다.
- `contracts/*.sample.json`은 이번 branch에서 변경하지 않는다. 실제 `route`, `retrieval_trace` 필드 추가가 필요해지는 후속 implementation/contract PR에서 sample을 함께 갱신한다.

## Conflicts To Resolve / 해결할 충돌

- 없음. M6가 M5 CatalogMetadata를 읽기 전용으로 소비하고 SQL engine은 adapter 뒤에 둔다는 기준으로 정리했다.
