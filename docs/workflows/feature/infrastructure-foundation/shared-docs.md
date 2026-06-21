# Infrastructure foundation 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `.github/workflows/ci.yml` | CI workflow 후보 추가 | harness, image, manifest 검증을 PR 기준으로 만들기 위해 | 낮음 |
| `.github/workflows/deploy-dev.example.yml` | dev deploy approval gate 예시 추가 | 실제 AWS action 전 승인 흐름을 분리하기 위해 | 낮음 |
| `.env.example` | secret 없는 환경 변수 예시 추가 | 필요한 env 이름만 공유하기 위해 | 낮음 |
| `infra/` | Docker, Kubernetes, AWS approval foundation 추가 | 제품 기능 전에 배포 가능한 골격을 잡기 위해 | 중간 |
| `docs/reports/phase-2-infrastructure-foundation.md` | Phase evidence 추가 | 다음 작업자가 검증 결과를 볼 수 있게 하기 위해 | 낮음 |

## Integration Notes / 통합 메모

- 실제 AWS resource 생성은 하지 않았다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
