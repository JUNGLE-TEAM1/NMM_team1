# M5 Overview Demo Guide 노트

## 관찰

- M5 중심 구현은 `backend/app/services/week2_workflow.py`의 `Week2WorkflowService`다.
- `/etl` 화면은 `frontend/src/app/App.jsx`의 `M5DemoPage`에서 M5 학습 흐름으로 구성되어 있다.
- `frontend/product-health-airflow-demo.html`은 product-health Airflow/Catalog smoke를 보여주는 독립 HTML 페이지다.
- M5는 변환 의미 자체보다 `ExecutionResult`, output path, `CatalogMetadata`, lineage 연결을 맡는다.

## 설명 핵심

- 같은 `run_id`가 `ExecutionResult -> output -> CatalogMetadata.lineage`로 이어지면 M5 기본 설명이 닫힌다.
- `local_runner + fallback_succeeded`는 local demo 경로에서는 정상 성공으로 설명한다.
- `airflow + fallback_succeeded`는 Airflow 성공이 아니라 local fallback 성공이다.
- 실패 run은 run history에는 남을 수 있지만 최신 Catalog를 덮으면 안 된다.

## 사용자 변경 보호

- 기존 dirty 파일 `docs/reports/README.md`, `docs/workflows/README.md`, `docs/workflows/feature/m5-airflow-smoke-integration/sync.md`, `docs/workflows/docs/harness-status-entrypoints/`를 확인했다.
- 이 작업은 필요한 index 한 줄 외에는 기존 dirty workspace/status 파일을 건드리지 않는다.
