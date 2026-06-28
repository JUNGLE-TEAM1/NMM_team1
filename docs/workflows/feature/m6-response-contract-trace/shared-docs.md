# M6 response contract route and retrieval trace 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | module ownership과 runtime architecture는 그대로이며 response field만 additive로 확장 | 낮음 |
| `docs/03-interface-reference.md` | `AIQueryResult.route`와 `retrieval_trace[]` 최소 shape 추가 | M1/M6 public contract에 새 field를 명시해야 함 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Week 2/M6 Ask acceptance에 route/trace 표시 기준 추가 | M6 선택 근거를 응답으로 남기는 완료 기준 필요 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | route/trace가 evidence와 어긋나는 failure scenario 추가 | SQL/RAG/Unsupported path 오표시를 regression으로 막기 위해 | 낮음 |
| `docs/07-manual-verification-playbook.md` | product risk AI Query manual check에 route/trace 확인 추가 | 수동 검증 시 DuckDB 결과뿐 아니라 M6 route/evidence trace도 확인 | 낮음 |
| `contracts/ai_query_result.sample.json` | sample response에 `route`와 `retrieval_trace` 추가 | contract fixture가 실제 API response field를 대표해야 함 | 중간 |

## Integration Notes / 통합 메모

- 이 branch는 M5 Catalog write path를 바꾸지 않는다. M6는 기존 CatalogMetadata 선택 결과를 읽어 trace로 노출한다.
- 이 branch는 M1 UI를 바꾸지 않는다. 기존 M1 consumer는 기존 field를 계속 읽을 수 있고, 후속 M1 Phase에서 새 field를 표시할 수 있다.
- `rag`와 `hybrid` 값은 contract enum에는 포함하지만 현재 실행 route로는 사용하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- 없음. 단, 동시에 `AIQueryResult` sample이나 M1 query rendering을 바꾸는 branch가 있으면 `route`/`retrieval_trace` additive field를 함께 반영해야 한다.
