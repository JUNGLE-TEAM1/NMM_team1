# Catalog metadata integration 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: 성공한 Target Dataset Job Run을 CatalogDataset으로 publish하는 API와 UI 액션을 추가하고, Gold Datasets 화면에서 registered output을 확인할 수 있게 했다.
- Verified: backend focused tests 11 passed, frontend build 통과, HTTP smoke와 browser smoke에서 publish와 Gold Datasets 표시를 확인했고 smoke data/output을 정리했다.
- Remaining: AI Query가 새 CatalogDataset context를 소비하는 C-7, SQL allowlist 세부 생성, Airflow/Spark 실제 실행.
- Next context: C-7은 `CatalogDataset.lineage/metrics/storage/runtime_evidence/source_evidence`를 읽어 M6 query context로 연결한다.
- Risk: C-6은 local runner JSONL output publish까지만 다루며 5GB 처리나 Airflow 실행 증거를 새로 만들지 않는다.
