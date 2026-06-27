# M2 MinIO S3-compatible storage adapter 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 고영향 선택지는 열지 않는다. Week2 ver2 책임 분리에 따라 M2는 MinIO/S3-compatible storage smoke와 `RuntimeConfig` 경계를 소유한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| storage adapter 첫 slice | S3-compatible URI와 local fallback path 계산 + local write | 실제 MinIO/AWS 업로드를 바로 넣으면 endpoint/credential/네트워크 리스크가 커진다. 먼저 모든 runner/catalog가 같은 prefix 계약을 쓰게 만든다. | 사용자 "그래 그러면 다음 진행하자" / 2026-06-27 |
| 데이터 품질 처리 | M2 범위 제외 | out-of-period 같은 품질 판단은 M3 TransformSpec/quality rule 책임이다. M2는 저장/실행 evidence 경계만 제공한다. | 사용자 확인 / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 MinIO object upload | 이번 PR은 endpoint/credential 없이 재현 가능한 local smoke가 목적이다. | 팀이 MinIO endpoint와 bucket 실행 방식을 확정할 때 | M2 MinIO upload follow-up |
| AWS S3 연결 | cloud credential/resource approval이 필요하다. | 배포/클라우드 실행 Phase에서 승인될 때 | post-MVP 또는 deploy Phase |
| PySpark distributed execution | storage 경계가 먼저 안정돼야 한다. | storage adapter merge 후 Spark local/cluster smoke 시작 시 | M2 PySpark follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| local fallback path와 `s3_uri` prefix가 달라진다 | M5 Catalog 또는 M6 SQL smoke가 다른 위치를 보게 된다 | storage adapter를 우선 수정하고 runner별 직접 path 조립을 제거한다 |
