# M2 Spark direct s3a write smoke 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 긴 option brief는 작성하지 않는다. 사용자 결정은 "Driver는 Docker 안에서 실행, 공개 Spark image로 시작, worker 2개, 작은 Taxi smoke 후 5GB로 확장, 실패 시 schema drift는 runner 보정 대상으로 본다"로 이미 주어졌다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| direct S3A smoke 방식 | 공개 Spark image + Spark submit `--packages` | 공개 image에는 Hadoop AWS jar가 없지만, custom image를 만들기 전에 실행 시점 package 주입으로 빠르게 검증할 수 있다. | user direction / 2026-06-29 |
| output shape | Spark Parquet directory를 `s3a://.../run_id=.../`에 직접 write | S3A direct write는 단일 local file로 정리하지 않고 Spark 표준 directory output을 남기는 것이 자연스럽다. | implementation / 2026-06-29 |
| 5GB direct S3A | 이번 PR에서 보류 | 작은 direct S3A path를 먼저 검증하고, 5GB는 같은 mode로 후속 실행하면 된다. | implementation / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| real AWS S3/IAM | credential/IAM/resource 결정이 없고 local MinIO smoke가 이번 Phase 목표다. | AWS bucket/IAM이 확정될 때 | M2 AWS S3 smoke |
| Hadoop AWS jar bake-in | 현재는 `--packages`로 충분하고 custom image는 운영 편의 선택이다. | Maven 접근이 막히거나 반복 실행 시간이 문제가 될 때 | Docker Spark image hardening |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `--packages` 다운로드가 실패한다 | Maven network가 막힌 환경 | Hadoop AWS jars를 repo 외부 runtime cache에 준비하거나 custom Spark image로 분리한다 |
| Spark direct write가 Product Health에서 실패한다 | source format/spec 처리와 S3A 설정 중 실패 원인을 분리해야 한다 | 먼저 controlled small Product Health input으로 direct S3A smoke를 재현한다 |
