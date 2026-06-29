# M6 Hybrid Route 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | M6 Hybrid Route policy table과 route 설명 갱신 | `sql`/`rag`/`hybrid`/`unsupported` 실행 의미를 공유 계약에 명시 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Hybrid route와 RAG-only no-SQL acceptance 추가 | Query/Ask 완료 기준에 Step 7 route behavior를 연결 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | Hybrid/RAG-only route mismatch와 no-SQL regression 기준 추가 | SQL engine 호출 누락/과잉 호출 회귀를 막기 위해 | 낮음 |
| `docs/07-manual-verification-playbook.md` | Hybrid/RAG-only manual 질문 추가 | 사람이 route별 응답을 직접 확인할 수 있게 함 | 낮음 |
| `contracts/ai_query_result.sample.json` | sample route를 `hybrid` 예시로 갱신 | M1/리뷰어가 `hybrid` 응답 형태를 fixture에서 볼 수 있게 함 | 중간 |

## Integration Notes / 통합 메모

- `AIQueryResult` public field는 추가하지 않는다. 기존 additive `route` enum과 `retrieval_trace`를 사용한다.
- M5 Catalog 저장/API는 변경하지 않는다. M6는 `CatalogSource.list_catalogs()` 결과만 읽는다.
- PR #241이 merge되기 전에는 이 branch가 #241 위에 stacked 되어 있음을 리뷰어가 인지해야 한다.

## Conflicts To Resolve / 해결할 충돌

- 없음. 단, PR #241 merge 전 main 기준 PR을 만들면 Step 6 diff가 함께 보일 수 있다.
