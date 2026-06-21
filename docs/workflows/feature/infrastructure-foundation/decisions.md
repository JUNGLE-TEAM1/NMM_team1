# Infrastructure foundation 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Infrastructure foundation before product feature development.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Infrastructure foundation | CI/CD + Docker + Kubernetes manifest + AWS approval checklist first | 사용자가 개발 시작 전 CI/CD, Docker, Kubernetes, AWS를 먼저 세팅하고 싶다고 요청 | user request / 2026-06-22 |
| AWS resource action | Do not create paid resources in this Phase | 비용/권한/rollback 확인 전 실제 resource 생성을 막기 위해 | user request + safety gate / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| AWS deploy target | EKS, ECS/Fargate, App Runner, EC2 중 선택 필요 | 실제 배포 resource를 만들기 전 | `feature/infrastructure-foundation` follow-up 또는 infra decision |
| Image registry | ECR vs GHCR 결정 필요 | image push workflow 구현 전 | `feature/container-app-skeleton` |
| Manifest format | Kustomize/plain manifests vs Helm 결정 필요 | 환경별 values가 필요해질 때 | `feature/container-app-skeleton` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| AWS resource action | approval checklist 없이 resource 생성 필요가 생기면 | 중단하고 `infra/aws/approval-checklist.md` 승인부터 받는다 |
| Smoke images | 실제 app code가 생기면 | smoke Dockerfile을 app Dockerfile로 교체한다 |
