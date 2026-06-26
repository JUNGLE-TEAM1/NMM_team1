# M5 Local Runner Representative Path 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교는 생략했다. 이번 slice는 기존 M5 local runner baseline을 test evidence로 고정하는 낮은 위험의 characterization 작업이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Representative path 검증 방식 | test-only characterization | 현재 local runner 대표 경로는 이미 구현되어 있고, 다음 위험은 Airflow/Spark adapter 연결 시 기존 run/catalog/output 연결이 깨지는 것이다. | slice 실행, 2026-06-26 |
| Source of Truth 계약 변경 | 변경하지 않음 | `ExecutionResult`, `CatalogMetadata`, runner boundary 계약 자체는 바뀌지 않았다. | slice 실행, 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 Airflow trigger | 이번 slice는 local runner 대표 경로 증거 고정이 목적이다. | Airflow runtime/API/DAG trigger 환경과 polling contract가 준비될 때 | M5 Airflow adapter follow-up |
| SparkRunner integration | M2 SparkRunner smoke가 먼저 `Week2RunnerResult` 호환 result를 반환해야 한다. | M2 SparkRunner smoke branch가 준비될 때 | M5/M2 runner integration follow-up |
| M3 TransformSpec adapter | M3 TransformSpec fixture/test가 아직 runner input으로 연결되지 않았다. | M3 TransformSpec 산출물이 준비될 때 | M5/M3 runner adapter follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| test-only characterization | Airflow/Spark runner가 output path나 Catalog metrics semantics를 바꾸는 경우 | test expectation과 Source of Truth 계약을 함께 재검토한다. |
| Source of Truth 미수정 | output path pattern, run status semantics, Catalog metrics semantics가 변경되는 경우 | `docs/03`, `docs/05`, `docs/06`, `docs/07` 영향 여부를 검토한다. |
