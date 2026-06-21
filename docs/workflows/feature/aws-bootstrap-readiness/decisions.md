# AWS bootstrap readiness 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- EKS-ready bootstrap vs ECS/Fargate vs App Runner: EKS-ready selected for this Phase because existing Kubernetes manifests can be reused. ECS/Fargate and App Runner remain possible follow-ups if MVP speed or cost becomes more important than Kubernetes continuity.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| AWS bootstrap target | EKS-ready bootstrap | Reuses existing Kubernetes manifests and keeps the deployment path close to the infrastructure foundation Phase | User asked to proceed on 2026-06-22 |
| GitHub Actions AWS auth | OIDC IAM role | Avoids long-lived AWS access keys in GitHub Secrets and matches current AWS/GitHub guidance | User asked to proceed on 2026-06-22 |
| Resource creation safety | `--execute` plus `ASKLAKE_AWS_APPROVED=APPROVED` | Keeps scripts ready to run while preventing accidental resource creation | User asked to proceed on 2026-06-22 |
| Completion handoff choices | Prompt with PR, hardening, next phase, hold, and external approval options | Prevents complete branches from ending with unclear next action while preserving explicit approval for remote/external work | User approved on 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| ECS/Fargate/App Runner target | Not needed for the EKS-ready path | If EKS cost/ops burden is rejected | Future AWS target decision |
| Production-grade Terraform/CDK | Current goal is immediate bootstrap readiness, not full IaC platform | Before persistent staging/prod environments | Future infra hardening Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| EKS-ready bootstrap | EKS cost or ops burden is too high | Create a new target decision for ECS/Fargate or App Runner before running AWS resource creation |
| AWS resource creation | approval checklist is incomplete | Stop; do not run `--execute` scripts or `dry_run=false` deploy workflow |
