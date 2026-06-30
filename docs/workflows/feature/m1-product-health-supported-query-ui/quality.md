# M1 Product Health supported query UI 품질 기록

## Context Budget

- Mode: Lite Read
- 주요 문서: `AGENTS.md`, PH-DATA-5 report, `docs/05`, `docs/06`, `docs/07` Product Health/M1/M6 관련 항목
- Tool/skill: browser skill + `node_repl`로 local web smoke 확인

## 검증

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| API smoke | `POST /api/week2/ai/query` | passed | `status=succeeded`, `dataset_product_health_gold`, `engine=duckdb`, first row `aph_prod_000006`, `risk_score=88.23` |
| browser smoke | `http://127.0.0.1:13011/query` | passed | Product Health answer panel 표시, `processed_input_bytes=5.28 GiB`, `gold_rows=1000` |
| browser console | in-app browser dev logs | passed | console error 없음 |

## 수동 확인 결과

- 기본 질문: `리뷰가 나쁘고 구매 전환도 낮고 배송 지연까지 겹친 문제 상품군을 찾아줘`
- 화면 표시: `Product Health answer`, `SQL grounded`, `review_delivery_risk`, `negative_reviews|late_delivery`
- 근거 표시: `run_product_health_5gb_001`, `gold_product_health`, `processed_input_bytes 5.28 GiB`

## 남은 리스크

- 첫 row의 `product_title`은 원본 metadata에서 온 중국어 상품명이다. 데모용으로 더 깔끔한 이름이 필요하면 별도 보정 Phase에서 `demo_product_label` 또는 표시용 fallback을 추가한다.
- 현재 branch는 `origin/feature/external-connection-persistence`보다 뒤처져 있다. 자동 pull/merge/rebase는 실행하지 않았다.
