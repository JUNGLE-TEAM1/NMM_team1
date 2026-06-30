# M1 Product Health supported query UI 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: `/query` 기본 질문을 Product Health 대표 질문으로 바꾸고, M6 `AIQueryResult` 성공 응답에서 첫 위험 상품군과 핵심 metric을 요약하는 `Product Health answer` panel을 추가했다.
- Verified: `cd frontend && npm run build`, `POST /api/week2/ai/query` smoke, in-app browser `/query` smoke, browser console error check 통과.
- Remaining: PR 전 branch sync와 포함 파일 선별 필요. 발표 화면에서 원본 상품명이 산만하면 표시용 label 보정이 필요하다.
- Next context: M1은 이제 `dataset_product_health_gold`, `run_product_health_5gb_001`, `gold_product_health`, `processed_input_total_bytes=5668612855`를 한 화면에서 보여준다.
- Risk: 현재 작업 branch가 remote보다 59 commits behind 상태다. 사람 확인 없이 pull/merge/rebase는 실행하지 않았다.

## Verification Evidence

| 항목 | 결과 |
| --- | --- |
| selected dataset | `dataset_product_health_gold` |
| route | `sql` |
| SQL engine | `duckdb` |
| first row | `aph_prod_000006`, `risk_score=88.23` |
| displayed processed input | `5.28 GiB` |
| displayed gold rows | `1000` |
| browser console | error 없음 |

## Manual Verification

- URL: `http://127.0.0.1:13011/query`
- 실행 질문: `리뷰가 나쁘고 구매 전환도 낮고 배송 지연까지 겹친 문제 상품군을 찾아줘`
- 화면 확인: `Product Health answer`, `SQL grounded`, `review_delivery_risk`, `negative_reviews|late_delivery`, `processed_input_bytes 5.28 GiB`
