# M1 query route trace UI 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m1-query-route-trace-ui`, `docs/workflows/feature/m1-query-route-trace-ui`
- Date: 2026-06-28
- Workspace state: complete
- Changed: M1 `/query` 화면에 `AIQueryResult.route`와 `retrieval_trace[]` 표시를 추가하고, blocked/unsupported 결과의 빈 SQL이 placeholder SQL로 보이지 않게 했다.
- Verified: frontend build, route/trace keyword scan, API SQL/unsupported route samples, browser SQL/unsupported route smoke, mobile trace panel overflow check, strict harness validation.
- Remaining: Product Health 대표 경로 route/trace 검증과 기존 evidence table 모바일 overflow는 후속 Phase로 남긴다.
- Next context: 다음 M1 Phase는 Product Health readiness UI 또는 `/etl` Catalog CTA fix를 선택한다.
- Risk: 이번 smoke는 `dataset_reviews_gold` supporting path 기준이며 5GB/Product Health 최종 통합 증거를 대체하지 않는다.

## Verification Evidence / 검증 증거

- SQL 질문: `status=succeeded`, `route=sql`, `engine=duckdb`, rows=3, `retrieval_trace[0].source_id=dataset_reviews_gold`.
- Unsupported 질문: `status=blocked`, `route=unsupported`, guardrail failure message 표시.
- Browser `/query`: `route=sql`, trace title, `dataset_reviews_gold`, `score 15`, matched terms, `evidence index 0`, DuckDB rows 표시.
- Browser unsupported route: `route=unsupported`, `blocked`, failure text, SQL 성공으로 처리하지 않는 warning, `SQL not generated: blocked or unsupported route` 표시.
- Browser console errors: `[]`.

## Final Judgment / 최종 판단

- Done: yes, for M1 query route trace UI.
- Follow-up: Product Health 대표 경로가 준비되면 같은 UI에서 `dataset_product_health_gold` route/trace를 재검증한다.
