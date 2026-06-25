# M2 taxi dataset bootstrap 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: mixed

## Decision Option Briefs / 결정 옵션 브리프

- `yellow_tripdata_2024-01.parquet`를 로컬 기준 파일로 사용할지, 더 작은 샘플만 사용할지 비교했다.
- Spark를 첫 구현 필수 조건으로 둘지, runner 경계만 Spark 전환 가능하게 유지할지 비교했다.
- PostgreSQL table과 첫 Gold dataset 이름을 M2/M5/M6 handoff 기준으로 정리했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M2 로컬 기준 파일 | `yellow_tripdata_2024-01.parquet` | 2024년 schema가 첫 안정화에 유리하고, 로컬 확인 결과 약 48MB / 2,964,624 rows로 smoke보다 큰 처리 증거를 만들 수 있다. | 사용자 대화 / 2026-06-25 |
| 데이터 규모 단계 | `demo -> fixed -> local-full-month -> scale-target` | 한 달 파일 전체 처리는 로컬 검증에는 충분하지만, 전체 Taxi dataset 또는 GB/TB급 적재 가능성을 증명하지는 않으므로 목표를 분리한다. | 사용자 대화 / 2026-06-25 |
| 초기 실행 엔진 | Python 기반 batch runner 허용, Spark 전환 가능 interface 유지 | 첫 PR은 데이터 선택/범위/계약 mapping이고, 분산 처리 도입은 실제 병목 또는 scale-target 요구가 확인된 뒤 판단한다. | 사용자 대화 / 2026-06-25 |
| PostgreSQL table | `taxi_trips` | M2 정형 batch 입력을 PostgreSQL table 기준으로 고정하면 M1/M5 source 연결과 M2 batch 구현 경계가 단순해진다. | 사용자 대화 / 2026-06-25 |
| 첫 Gold dataset | `gold_taxi_daily_metrics` | 날짜별 운행 수, 거리, 금액, 품질 metric은 UI, SQL/RAG, batch 검산에 모두 쓰기 쉽고 원본 296만 rows를 분석용 요약으로 줄인다. | 사용자 대화 / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 전체 Taxi dataset 적재 범위 | 첫 PR은 로컬 기준과 계약 mapping이 목표이며, multi-month/year 적재는 storage/partition/engine 선택이 필요하다. | `local-full-month` 검증 후 또는 발표/리뷰에서 GB/TB급 증거가 요구될 때 | 후속 `scale-target` branch |
| Spark 도입 시점 | 현재는 engine보다 계약 경계와 batch path 안정화가 우선이다. | local runner가 시간/메모리 한계를 반복적으로 넘거나 Airflow에서 Spark submit이 필요해질 때 | 후속 implementation branch |
| MinIO bucket/prefix와 Catalog 등록 방식 | M5 Workflow/Catalog 책임 범위와 맞춰야 한다. | M5의 WorkflowDefinition/Catalog adapter 초안이 확정될 때 | M5 integration 또는 M2 handoff |
| `ExecutionResult.row_count` 의미 | M2는 input trip row 수를 제안하지만, M5 run status 표준과 맞춰야 한다. | M5 Workflow/Status/Log contract 확인 시 | M5 integration 또는 M2 implementation branch |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
|  |  |  |
