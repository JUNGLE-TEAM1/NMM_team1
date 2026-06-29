# M5 Product-Health Catalog Lineage 계획

## 목표

`pipeline_product_health_e2e` 실행 결과를 M5 표준 `ExecutionResult`, `CatalogMetadata`, lineage로 연결한다.

## 범위

- 기존 `pipeline_reviews_json_e2e` / `dataset_reviews_gold` 경로는 유지한다.
- 새 `pipeline_product_health_e2e` / `dataset_product_health_gold` 경로를 추가한다.
- product-health 계산식, join, risk_score semantics는 M2/M3 소유로 남긴다.
- M5는 runner 결과를 받아 run/catalog/evidence로 저장한다.

## 단계

1. workflow/catalog contract fixture를 product-health용으로 추가한다.
2. `Week2WorkflowService`를 pipeline id별 bundle registry로 확장한다.
3. `run_product_health_demo_###` sequence를 reviews sequence와 분리한다.
4. product-health handoff runner로 M5 계약을 고정하고, 실제 M2/M3 runner가 붙을 자리를 남긴다.
5. 실패 run이 latest successful Catalog를 덮지 않는 회귀 테스트를 추가한다.
6. 관련 interface/acceptance/regression/manual verification 문서를 최소 범위로 갱신한다.
7. product-health Airflow smoke DAG를 추가하고 `pipeline_id`별 DAG routing을 고정한다.
8. 기존 React 앱과 독립된 product-health Airflow demo page를 추가한다.

## 완료 기준

- `POST /api/week2/workflows/pipeline_product_health_e2e/runs`가 `ExecutionResult`를 반환한다.
- `GET /api/week2/catalog/dataset_product_health_gold`가 `gold_product_health` SQL context를 포함한다.
- source별 evidence와 Gold output path가 같은 `run_id`로 묶인다.
- `executor=airflow` product-health run이 `asklake_week2_product_health` DAG로 라우팅된다.
- `frontend/product-health-airflow-demo.html`에서 run receipt, source evidence, Catalog metadata를 확인할 수 있다.
- 기존 reviews/Airflow/Spark focused tests가 통과한다.
