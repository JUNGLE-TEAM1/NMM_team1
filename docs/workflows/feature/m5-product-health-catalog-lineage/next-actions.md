# M5 Product-Health Catalog Lineage 다음 작업

## Recommended Next Action

- Airflow local smoke를 실제 Docker 환경에서 열어 `asklake_week2_product_health` DAG와 `frontend/product-health-airflow-demo.html`을 사람이 한 번 확인한다.

## 바로 다음 후보

1. M2/M3 product-health runner integration
   - 실제 product-health transform output을 `Week2RunnerResult`로 M5에 넘긴다.

2. M6 product-health SQL planner
   - `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate` 기반 대표 SQL을 추가한다.

3. M1 product-health 발표 UI
   - M5 Catalog evidence와 M6 query result를 위험 상품군 카드/테이블로 표시한다.

4. Airflow DAG 내부 runner 교체
   - M2/M3 runner가 Airflow runtime에서 import 또는 호출 가능해지면 smoke fixture 대신 실제 product-health runner 결과를 소비한다.
