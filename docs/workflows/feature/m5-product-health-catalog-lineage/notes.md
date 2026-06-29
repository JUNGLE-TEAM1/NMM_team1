# M5 Product-Health Catalog Lineage Notes

- 기존 reviews path는 M5 baseline이므로 삭제하거나 이름을 바꾸지 않는다.
- product-health path는 발표 contract를 M5에 연결하기 위한 추가 path다.
- `Week2ProductHealthHandoffRunner`는 M5 contract 고정용 fixture다. 실제 5GB evidence와 transform semantics는 M2/M3 runner가 같은 `Week2RunnerResult` shape로 제공해야 한다.
- `pyarrow`가 partition directory의 `run_id=...` segment를 읽을 때 가상 `run_id` column을 보여줄 수 있다. Catalog allowlist에는 product-health business columns만 둔다.
- Airflow 컨테이너에는 `backend/app`이 mount되지 않는다. 따라서 `asklake_week2_product_health` DAG는 backend runner를 import하지 않고 DAG 파일 안에서 smoke evidence를 만든다.
- Airflow image에 `pyarrow`가 없을 수 있어 product-health DAG는 Parquet 쓰기를 먼저 시도하고, 불가능하면 JSONL smoke output으로 fallback한다. M5 API/Catalog 계약은 output path와 metrics를 그대로 기록한다.
- `frontend/product-health-airflow-demo.html`은 main React route와 독립된 단일 페이지다. Vite dev server에서 `/api` proxy를 쓰고, 필요하면 API base를 직접 입력할 수 있다.
