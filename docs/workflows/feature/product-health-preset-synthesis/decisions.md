# Product Health Preset Synthesis 결정 기록

## C-41 범위 결정

- Decision: Product Health preset 합성은 기존 local synthesis script를 감싸는 demo-only API/UI로 제한한다.
- Reason: 데모에서 필요한 것은 합성 결과 artifact 재생성과 후속 Run/Catalog/AI Query 입력 준비이며, 범용 ETL builder나 production runner는 별도 Phase가 필요하다.
- Deferred: Airflow/Spark execution, 5GB evidence 재측정, arbitrary processing recipe editor.
