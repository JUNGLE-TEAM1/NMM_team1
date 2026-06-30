# Catalog metadata integration 계획

## 목표

C-5에서 성공한 Job Run 결과를 CatalogDataset으로 publish해 Gold Dataset 화면에서 확인 가능하게 만든다.

## 범위

- `POST /api/target-dataset-job-runs/{run_id}/publish-catalog`
- CatalogDataset `lineage`, `metrics`, `storage`, `runtime_evidence`, `source_evidence`
- 실행 기록의 `Catalog 등록` 액션
- 데이터셋 > Gold Datasets의 registered output 표시

## 제외

- AI Query context 소비
- SQL allowlist 자동 생성
- Airflow/Spark 실제 실행
- 5GB Product Health batch 재처리
