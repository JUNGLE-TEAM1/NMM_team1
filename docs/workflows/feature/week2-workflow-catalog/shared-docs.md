# Week 2 Workflow Catalog 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | Week 2 execution metric semantics와 optional `dataset_path` storage pattern 반영 | M2 Taxi bootstrap PR #98과 M5 Workflow/Catalog가 같은 `ExecutionResult`/`CatalogMetadata` metric 의미를 공유해야 함 | 중간 |
| `contracts/source_config.sample.json` | demo fixture path와 10-row sample availability 반영 | M5 local runner와 UI node board가 node별 transform 차이를 보여주는 demo input을 필요로 함 | 낮음 |
| `contracts/workflow_definition.sample.json` | `runner.fallback_condition` TODO를 #94 fallback threshold로 확정 | Airflow adapter unavailable/error 또는 `succeeded` 외 status에서 local runner fallback이 일어나도록 구현과 계약을 맞춤 | 낮음 |
| `contracts/execution_result.sample.json` | `metric_semantics`와 input metric definition 반영 | `ExecutionResult.row_count/bytes`가 primary input 기준임을 fixture에서 직접 확인 가능하게 함 | 낮음 |
| `contracts/catalog_metadata.sample.json` | `metrics.semantics`로 output dataset metric definition 반영 | Catalog와 M6가 output dataset row/bytes를 사용하도록 명확히 하기 위해 | 낮음 |

## Integration Notes / 통합 메모

- `/api/week2/*` route는 `docs/03-interface-reference.md`의 Week 2 draft API/UI route contract를 따른다.
- M2 Taxi mapping은 `ExecutionResult.row_count/bytes` input 기준, `CatalogMetadata.metrics.row_count/bytes` output 기준으로 맞춘다.
- 실제 외부 Airflow/MinIO 구현이 들어오면 Interface 또는 Architecture 문서 변경 필요 여부를 다시 판단한다.

## Conflicts To Resolve / 해결할 충돌

- 없음
