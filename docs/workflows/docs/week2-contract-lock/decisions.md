# Week2 contract lock 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교는 생략했다. 직전 검토 응답의 추천 잠금안을 사용자가 "추천안으로 잠그고"라고 확정했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Week 2 계약 잠금 범위 | `RuntimeConfig`, `TransformSpec`, `KafkaTopicContract`, `ExecutionResult.duration_ms`, `SqlEngineAdapter.explain_schema(context)`, fixture-first source/schema route | M2/M3/M4/M5/M6 병렬 구현 전에 runtime/transform/raw event/result/query 경계를 먼저 맞춰야 함 | 사용자 요청, 2026-06-26 |
| main 직접 반영 | branch checkout 없이 `main`에서 계약 결과 반영 | 사용자가 "계약 결과를 main에 올려주세요"라고 명시 | 사용자 요청, 2026-06-26 |
| Source/schema preview route | 구현 전까지 fixture-first | 현재 executable route와 미구현 draft route를 구분해 M1/M3 혼선을 줄임 | 사용자 요청 기반 추천안 적용, 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 MinIO endpoint | M2/M5 runtime smoke 전까지 환경값 미검증 | M2 `RuntimeConfig` smoke 또는 M5 runner handoff | M2 RuntimeConfig/SparkRunner smoke 또는 M5 runner selection |
| fixed/extended sample row count | M3 sample reader 구현 전까지 실제 데이터 범위 미검증 | M3 JSON sample/profile 구현 | M3 JSON TransformSpec |
| M4 replay rate와 source file | M4 Kafka replay evidence 구현 전까지 미검증 | M4 replay command/evidence 확정 | M4 Kafka Ingestion |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| fixture-first source/schema route | M1/M3가 실제 endpoint를 구현하기로 결정 | `docs/03` route table과 contracts를 먼저 갱신하고 endpoint 구현 |
| `RuntimeConfig.runner = "spark"` | Spark smoke가 실패하거나 준비되지 않음 | M5는 local runner fallback 유지, Catalog latest successful run만 갱신 |
| Kafka raw event handoff | Kafka가 main path blocker로 바뀜 | main E2E path와 `KafkaTopicContract` 범위를 별도 결정으로 재검토 |
