# M2 Spark direct s3a write smoke 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | M2 Taxi Docker Spark evidence가 adapter upload와 direct S3A write 두 smoke path를 가진다고 정리 | M5/M6가 output path 의미를 혼동하지 않게 하기 위해 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | storage regression expected behavior에 direct S3A write와 secret handling을 추가 | storage path 회귀 시 adapter upload와 direct write를 모두 보호하기 위해 | 낮음 |
| `docs/07-manual-verification-playbook.md` | `direct-s3a-small` 수동 검증 절차와 성공 기준 추가 | 다음 팀원이 같은 smoke를 재현할 수 있게 하기 위해 | 낮음 |
| `docs/reports/README.md` | direct S3A report index 추가 | 최신 M2 evidence report를 찾을 수 있게 하기 위해 | 낮음 |

## Integration Notes / 통합 메모

- 적용 완료. 이 branch는 Source of Truth 제안 파일을 실제로 수정했다.
- `minio-small`은 local fallback file을 만든 뒤 `Week2StorageAdapter`가 업로드하는 경로이고, `direct-s3a-small`은 Spark writer가 `s3a://` output prefix에 직접 Parquet directory를 쓰는 경로다.

## Conflicts To Resolve / 해결할 충돌

- none
