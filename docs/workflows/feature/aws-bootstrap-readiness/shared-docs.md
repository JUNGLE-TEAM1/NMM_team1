# AWS bootstrap readiness 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | AWS bootstrap readiness 단계, ECR/EKS 승인 후 bootstrap, AWS env 변수 추가 | 인프라 실행 경로를 Source of Truth에 반영 | 중간 |
| `docs/04-development-guide.md` | AWS bootstrap script plan/execute gate와 GitHub OIDC 우선 규칙 추가 | 개발자가 실제 AWS 명령을 안전하게 실행하도록 하기 위해 | 중간 |
| `.env.example` | AWS bootstrap 변수 이름 추가 | 로컬/CI 연결 직전 필요한 값 공유 | 낮음 |
| `.github/workflows/deploy-dev.yml` | manual dispatch + approval + dry-run 기본 dev deploy workflow 추가 | 승인 후 바로 ECR/EKS deploy path 사용 | 중간 |
| `infra/README.md` | AWS bootstrap readiness 산출물 목록 추가 | 다음 사람이 실행 파일 위치를 찾기 쉽게 하기 위해 | 낮음 |
| `infra/aws/approval-checklist.md` | EKS-ready, OIDC, ECR, namespace, smoke/rollback 후보 확정 | 승인 전 체크 항목을 실행 가능한 수준으로 구체화 | 중간 |
| `infra/aws/` | env, OIDC, ECR, EKS, readiness 문서 추가 | 실제 AWS 생성 전 재현 가능한 준비물 확보 | 중간 |
| `scripts/aws/` | readiness/check/render/bootstrap 스크립트 추가 | 승인 직후 실행 가능한 명령 제공 | 중간 |

## Integration Notes / 통합 메모

- 실제 AWS resource는 생성하지 않는다.
- `scripts/aws/* --plan`은 명령 출력만 하고, `--execute`는 승인 환경 변수 없이는 실패해야 한다.

## Conflicts To Resolve / 해결할 충돌

- AWS 계정/region/profile이 아직 실제로 연결되지 않았다.
