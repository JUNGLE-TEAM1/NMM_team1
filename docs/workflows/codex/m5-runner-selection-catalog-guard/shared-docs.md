# M5 Runner Selection Catalog Guard Shared Docs

## Proposed Source Of Truth Changes

| File | Proposed change | Reason | Priority |
| --- | --- | --- | --- |
| n/a | 현재 없음 | 이번 Phase는 기존 ver2 runner boundary와 contract lock을 구현 운영 계획으로 따르는 작업이다. | 낮음 |

## Deferred Source Of Truth Considerations

| File | Deferred item | Revisit trigger |
| --- | --- | --- |
| `docs/03-interface-reference.md` | 실제 Airflow trigger/polling contract | external Airflow URL/auth/DAG/run status API를 구현할 때 |
| `contracts/runtime_config.sample.json` | 실제 SparkRunner selection fields 확정 | M2 SparkRunner smoke가 M5에 연결될 때 |
| `contracts/transform_spec.sample.json` | M3 TransformSpec adapter input 확정 | M3 JSON TransformSpec 구현이 M5 runner input으로 붙을 때 |
