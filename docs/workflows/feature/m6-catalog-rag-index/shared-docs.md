# M6 Catalog RAG Index 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | M6 Catalog RAG-lite index boundary와 안전한 included/excluded metadata 기준 추가 | interface/evidence contract에 retrieval trace source와 index safety 기준이 필요함 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | M6 Catalog RAG-lite acceptance와 stale rebuild 기준 추가 | Ask/Evidence 완료 기준에 RAG-lite trace와 derived cache 성격을 연결 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | unsafe index data와 stale cache failure scenario 추가 | local path/raw file/secret이 index에 들어가는 회귀를 막기 위해 | 낮음 |
| `docs/07-manual-verification-playbook.md` | product risk manual check에 schema/metric/lineage trace 확인 추가 | 사람이 SQL 결과와 함께 RAG-lite 근거까지 확인할 수 있게 함 | 낮음 |
| `contracts/ai_query_result.sample.json` | sample `retrieval_trace`에 schema trace 예시 추가 | M1/리뷰어가 trace가 catalog-only가 아니라 chunk 근거를 포함할 수 있음을 알게 함 | 중간 |

## Integration Notes / 통합 메모

- M5 Catalog 저장/API는 변경하지 않는다. M6는 `CatalogSource.list_catalogs()` 결과만 읽는다.
- SQL route는 유지된다. `rag`/`hybrid` route 실행은 이번 PR 범위가 아니다.
- `RetrievalIndex`와 `EmbeddingAdapter`는 포트로 추가되어 후속 external provider 교체가 가능하다.

## Conflicts To Resolve / 해결할 충돌

- 없음. 단, 동시에 `AIQueryResult.retrieval_trace` 또는 `contracts/ai_query_result.sample.json`을 바꾸는 PR이 있으면 trace item 추가를 함께 반영해야 한다.
