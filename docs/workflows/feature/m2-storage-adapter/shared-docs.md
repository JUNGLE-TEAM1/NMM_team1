# M2 MinIO S3-compatible storage adapter 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 필요 시 local fallback + S3-compatible adapter 경계를 명시 | M2 runtime storage 책임이 실제 코드로 생긴다. | 낮음 |
| `docs/03-interface-reference.md` | `RuntimeConfig.storage`와 Catalog storage path 결정 사항을 반영 | M3/M5/M6이 같은 storage contract를 봐야 한다. | 중간: contract fixture와 code가 같이 바뀐다 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Week2 storage adapter acceptance를 추가 | 완료 기준에 s3 uri/local fallback evidence가 들어가야 한다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | storage path drift regression을 추가할지 검토 | local path와 s3 uri prefix가 갈라지는 실패를 막아야 한다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | storage adapter smoke 확인 명령을 추가 | 사람이 output path와 catalog metadata를 확인할 수 있어야 한다. | 낮음 |

## Integration Notes / 통합 메모

- M2는 storage/runtime 경계를 제공하고, M3 quality/TransformSpec를 소유하지 않는다.
- 이번 PR의 MinIO/S3-compatible은 네트워크 업로드가 아니라 URI/path contract와 local fallback write다.

## Conflicts To Resolve / 해결할 충돌

- none
