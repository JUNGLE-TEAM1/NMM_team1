# M1 live UI Phase plan 다음 행동

## Recommended Next Action

- M1 Catalog Live UI PR #156 merge 이후, 다음 구현 Phase로 `M1 AI Query Live UI`를 시작한다.
- Reason: Phase 1~3의 API client, run status, catalog live UI가 main에 들어갔고, M6 PR #152까지 merge되어 `/ask`가 최신 `AIQueryResult`와 evidence grounding 계약을 소비할 수 있다.

## Options

| Option | Action | When to Choose |
| --- | --- | --- |
| 1 | Phase 4 시작 | 최신 `origin/main` 기준 새 branch에서 `/ask` live UI를 구현할 때 |
| 2 | Phase 4 범위 축소 | evidence grounding 전체 표시가 한 PR에 크면 summary/query_result/evidence 기본 표시로 먼저 자를 때 |
| 3 | 보류 | M6 응답 shape 또는 demo 질문이 다시 바뀔 가능성이 있을 때 |

## Resume Condition

- `origin/main`에 PR #156과 M6 PR #152가 모두 merge된 상태에서 새 feature branch를 만든다.

## Notes

- Phase 4는 `AIQueryResult.query_result`를 canonical SQL execution result로 표시한다.
- Phase 4는 `evidence[]`의 optional `table_name`, `schema_fields`, `metrics`, `lineage`, `retrieval_terms`를 방어적으로 렌더링한다.
- M1은 SQL, summary, retrieval/scoring을 직접 생성하지 않는다.
