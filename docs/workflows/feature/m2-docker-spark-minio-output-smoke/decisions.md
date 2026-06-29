# M2 Docker Spark MinIO output smoke 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Docker Spark MinIO smoke 방식 | Spark local fallback write 후 `Week2StorageAdapter` object upload | 이미 검증된 storage adapter 계약을 재사용하고, direct `s3a://` dependency를 이번 작은 Phase에 섞지 않는다. | user / 2026-06-29 |
| MinIO 배치 위치 | M2 Taxi Spark evidence 전용 compose에만 추가 | 기본 앱 compose를 무겁게 만들지 않고 M2 evidence 재현성만 높인다. | AI / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Spark direct `s3a://` write | Hadoop AWS jar/version, credential provider, endpoint 설정 검증이 필요하다. | 발표/완료 기준이 “Spark가 직접 S3에 쓴다”를 요구할 때 | follow-up |
| Product Health 5GB storage evidence | 입력 데이터와 최종 TransformSpec이 아직 준비되지 않았다. | M1/M3가 Product Health 5GB input/spec을 제공할 때 | follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Docker Spark MinIO smoke 방식 | CI 또는 manual smoke에서 adapter upload가 반복적으로 불안정할 때 | MinIO SDK 또는 custom image 도입을 별도 결정한다. |
