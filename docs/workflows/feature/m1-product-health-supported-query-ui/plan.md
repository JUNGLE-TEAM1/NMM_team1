# M1 Product Health supported query UI 계획

## 상태

Completed.

## 목표

PH-DATA-5에서 닫은 `dataset_product_health_gold` + M6 DuckDB SQL 결과를 M1 `/query` 화면에서 발표자가 바로 확인할 수 있게 한다.

## 범위

- `/query` 기본 질문을 Product Health 대표 질문으로 바꾼다.
- `AIQueryResult` 성공 응답에서 첫 위험 상품군과 핵심 metric을 요약 표시한다.
- 표시 대상은 `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate`, `processed_input_total_bytes`, `gold_rows`, `run_id`, `table_name`이다.
- 기존 route/trace/evidence/table 표시는 유지한다.

## 제외

- 새 backend API 추가.
- M6 SQL planner 의미 변경.
- Product Health synthetic data 재생성.
- 상품명/카테고리 label 미화.

## 완료 기준

- `/query`에서 기본 질문 실행 시 `dataset_product_health_gold`가 선택된다.
- UI에 Product Health answer panel이 보인다.
- panel에 5GB processed input 근거와 주요 risk metric이 표시된다.
- frontend build, API smoke, browser smoke가 통과한다.
