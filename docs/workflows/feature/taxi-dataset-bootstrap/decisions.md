# M2 taxi dataset bootstrap 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: mixed

## Decision Option Briefs / 결정 옵션 브리프

- `yellow_tripdata_2024-01.parquet`를 로컬 기준 파일로 사용할지, 더 작은 샘플만 사용할지 비교했다.
- Spark를 첫 구현 필수 조건으로 둘지, runner 경계만 Spark 전환 가능하게 유지할지 비교했다.
- PostgreSQL table과 첫 Gold dataset 이름을 M2/M5/M6 handoff 기준으로 정리했다.
- M5 확인 질문을 blocking gate로 둘지, M2 기본 가정으로 진행할지 정리했다.
- Parquet -> PostgreSQL loader 소유권, PostgreSQL 우선 입력, File source 후속 확장, local Gold output 우선 전략을 정리했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M2 로컬 기준 파일 | `yellow_tripdata_2024-01.parquet` | 2024년 schema가 첫 안정화에 유리하고, 로컬 확인 결과 약 48MB / 2,964,624 rows로 smoke보다 큰 처리 증거를 만들 수 있다. | 사용자 대화 / 2026-06-25 |
| 데이터 규모 단계 | `demo -> fixed -> local-full-month -> scale-target` | 한 달 파일 전체 처리는 로컬 검증에는 충분하지만, 전체 Taxi dataset 또는 GB/TB급 적재 가능성을 증명하지는 않으므로 목표를 분리한다. | 사용자 대화 / 2026-06-25 |
| 초기 실행 엔진 | Python 기반 batch runner 허용, Spark 전환 가능 interface 유지 | 첫 PR은 데이터 선택/범위/계약 mapping이고, 분산 처리 도입은 실제 병목 또는 scale-target 요구가 확인된 뒤 판단한다. | 사용자 대화 / 2026-06-25 |
| PostgreSQL table | `taxi_trips` | M2 정형 batch 입력을 PostgreSQL table 기준으로 고정하면 M1/M5 source 연결과 M2 batch 구현 경계가 단순해진다. | 사용자 대화 / 2026-06-25 |
| 첫 Gold dataset | `gold_taxi_daily_metrics` | 날짜별 운행 수, 거리, 금액, 품질 metric은 UI, SQL/RAG, batch 검산에 모두 쓰기 쉽고 원본 296만 rows를 분석용 요약으로 줄인다. | 사용자 대화 / 2026-06-25 |
| `demo` 범위 | 10,000 rows | smoke와 UI 연결 확인은 빠른 반복이 우선이다. | 사용자 대화 / 2026-06-25 |
| `fixed` 범위 | `pickup_date = 2024-01-01` | row offset보다 날짜 조건이 재현, 검산, SQL 설명에 유리하다. | 사용자 대화 / 2026-06-25 |
| M5 계약 질문 처리 | blocking gate로 두지 않고 M2 기본 가정으로 진행 | M5도 아직 표준을 모를 가능성이 높으므로 첫 PR에서는 합리적 기본값을 명시하고 후속 통합에서 adapter로 조정한다. | 사용자 대화 / 2026-06-25 |
| Parquet -> PostgreSQL loader 소유권 | M2가 로컬 dev용 loader를 소유한다. | M2가 `public.taxi_trips` 입력 상태를 직접 재현할 수 있어 후속 구현과 검증이 M1/M5 local setup에 막히지 않는다. 운영용 ingest, UI upload, 증분 적재는 범위 밖이다. | 사용자 대화 / 2026-06-25 |
| M2 batch 우선 입력 | PostgreSQL `public.taxi_trips` | M2 주제가 정형 source batch pipeline이므로 Parquet 파일 직접 처리보다 source connector/Workflow/Catalog 흐름과 맞는다. | 사용자 대화 / 2026-06-25 |
| File source 처리 | 후속 확장으로 남기되 구조상 막지 않는다. | 나중에 파일 업로드/파일 source도 필요하지만, 첫 구현에서 Postgres와 File을 동시에 구현하면 범위가 커진다. | 사용자 대화 / 2026-06-25 |
| Gold output 위치 | local Parquet path 우선, MinIO/S3 URI는 계약 필드로 유지 | 오늘~내일 구현은 local evidence가 빠르고 안정적이다. 나중에 M5 bucket/prefix가 확정되면 같은 `CatalogMetadata` 필드로 MinIO/S3 전환한다. | 사용자 대화 / 2026-06-25 |
| 구현 PR 검증 범위 | `fixed=pickup_date 2024-01-01` 필수, `local-full-month` manual/benchmark evidence | 빠른 PR 검증과 월별 전체 처리 증거의 균형이 좋다. 일주일 내 `scale-target`으로 확장한다. | 사용자 대화 / 2026-06-25 |
| 공식 계약 반영 시점 | 다음 M2 구현 branch에서 실제 코드와 함께 `docs/03`/`contracts` 반영 | M5 공통 구조는 확인됐지만 Taxi 전용 값은 코드가 사용하는 필드만 승격하는 편이 안전하다. | 사용자 대화 / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 전체 Taxi dataset 적재 범위 | 첫 PR은 로컬 기준과 계약 mapping이 목표이며, multi-month/year 적재는 storage/partition/engine 선택이 필요하다. | `local-full-month` 검증 후 또는 발표/리뷰에서 GB/TB급 증거가 요구될 때 | 후속 `scale-target` branch |
| Spark 도입 시점 | 현재는 engine보다 계약 경계와 batch path 안정화가 우선이다. | local runner가 시간/메모리 한계를 반복적으로 넘거나 Airflow에서 Spark submit이 필요해질 때 | 후속 implementation branch |
| 최종 MinIO bucket/prefix와 Catalog 등록 방식 | local Parquet output 우선 전략은 확정했지만, 실제 MinIO endpoint와 bucket/prefix 운영값은 M5 Workflow/Catalog 책임 범위와 맞춰야 한다. | M5의 Catalog adapter 또는 MinIO setup 초안이 확정될 때 | M5 integration 또는 M2 handoff |
| File source 구현 | PostgreSQL 우선으로 구현하되, 파일 source도 후속 제품 흐름에 필요하다. | Postgres batch path가 통과한 뒤 파일 업로드/파일 connector 흐름을 M1/M5와 맞출 때 | 후속 File source branch |
| Taxi 전용 공식 계약 승격 | 현재는 bootstrap notes에 Taxi mapping 초안을 두고 공유 계약 파일은 Amazon Reviews 공통 예시를 유지한다. | M2 구현 branch에서 `run_taxi_batch(config) -> ExecutionResult`와 `CatalogMetadata` 생성 코드가 생길 때 | M2 implementation branch |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
|  |  |  |
