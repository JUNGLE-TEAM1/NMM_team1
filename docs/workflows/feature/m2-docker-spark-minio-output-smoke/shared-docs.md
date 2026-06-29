# M2 Docker Spark MinIO output smoke 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` |  |  |  |
| `docs/03-interface-reference.md` | M2 Taxi Docker Spark evidence 설명에 opt-in MinIO upload smoke를 추가하고 direct `s3a://` write는 후속으로 남긴다. | Docker Spark 처리 결과가 S3-compatible object path까지 갈 수 있음을 계약 문맥에 반영한다. | Low: 기존 RuntimeConfig storage contract를 바꾸지 않고 evidence 범위만 갱신한다. |
| `docs/05-acceptance-scenarios-and-checklist.md` |  |  |  |
| `docs/06-regression-and-failure-scenarios.md` |  |  |  |
| `docs/07-manual-verification-playbook.md` | `minio-small` 실행 명령과 성공 기준을 추가한다. | 다음 사람이 Docker Spark + MinIO smoke를 재실행할 수 있어야 한다. | Low: manual verification command 추가만 포함한다. |

## Integration Notes / 통합 메모

- `RuntimeConfig.storage` schema 자체는 변경하지 않는다.
- MinIO credential 값은 commit하지 않고 compose/script는 환경 변수 이름과 기본 로컬 demo 값만 사용한다.

## Conflicts To Resolve / 해결할 충돌

- 
