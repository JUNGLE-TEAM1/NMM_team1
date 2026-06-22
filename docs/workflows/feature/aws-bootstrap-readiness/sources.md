# AWS bootstrap readiness source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/infrastructure-foundation`

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `feature/infrastructure-foundation` | `docs/workflows/feature/infrastructure-foundation` | `5ca144f` | 2026-06-22 | Used as completed infra foundation context |

## Integration Notes / 통합 메모

- AWS bootstrap readiness builds on the completed infrastructure foundation without creating real AWS resources.
- Official references checked: GitHub OIDC for AWS, aws-actions configure credentials, AWS CLI ECR create repository, EKS eksctl getting started.
