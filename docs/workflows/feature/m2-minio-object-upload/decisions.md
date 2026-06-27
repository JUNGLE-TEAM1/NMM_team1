# M2 MinIO 실제 업로드 smoke 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 이번 Phase는 고영향 cloud credential/AWS 선택을 하지 않는다. local MinIO smoke 범위라 `docs/14` 형식의 별도 비교표는 생략했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| MinIO upload implementation | existing `httpx` + internal SigV4 signed PUT | 새 SDK 추가 없이 local MinIO/S3-compatible PUT smoke를 작게 검증할 수 있다. | user proceed / 2026-06-27 |
| Upload activation | opt-in `RuntimeConfig.options.upload_to_object_storage=true` | 기존 local fallback과 workflow regression을 깨지 않고 실제 upload smoke만 선택적으로 수행한다. | user proceed / 2026-06-27 |
| Secret handling | env name only, no secret values in Git | MinIO credential 값은 로컬 실행 환경에서만 제공해야 한다. | repo guardrail / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| AWS S3 production profile | IAM, region, bucket policy, credential source가 아직 미정 | cloud/AWS 실제 연결이 필요할 때 | future M2 infra/storage Phase |
| Docker Compose MinIO service | 기본 compose smoke가 이미 Kafka/backend/frontend를 포함해 무거워졌고, 이번 PR은 runtime upload code smoke가 목적 | 팀이 MinIO를 기본 local stack에 넣기로 결정할 때 | future local infra Phase |
| Airflow DAG 내부 upload enable | M5 DAG 내부 SparkRunner 호출 범위가 아직 별도 Phase | M5 Airflow integration 시작 시 | M5/M2 integration Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| internal SigV4 helper | AWS compatibility edge case가 늘거나 multipart/large object upload가 필요해짐 | `boto3` 또는 MinIO SDK 도입을 별도 decision으로 검토 |
