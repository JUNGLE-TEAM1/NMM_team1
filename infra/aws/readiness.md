# AWS bootstrap readiness

이 문서는 AskLake를 AWS에 바로 연결할 수 있게 만들기 위한 실행 순서를 정의한다.
실제 비용이 발생하거나 IAM 권한을 바꾸는 명령은 사람 승인 뒤에만 실행한다.

## 현재 선택

- 기본 target: EKS-ready bootstrap
- image registry: Amazon ECR private repositories
- GitHub Actions 인증: OIDC 기반 IAM role
- local 인증: `asklake` AWS profile 또는 팀이 승인한 AWS profile
- namespace: `asklake-dev`

## 승인 전 확인

1. `infra/aws/bootstrap.env.example`의 값을 실제 계정/region/repo 이름에 맞게 정한다.
2. `aws configure --profile asklake` 또는 승인된 credential 방식을 완료한다.
3. `scripts/aws/check-readiness.sh`로 로컬 도구와 AWS identity를 확인한다.
4. `infra/aws/approval-checklist.md`의 비용, IAM, rollback, smoke 항목을 사람에게 승인받는다.

## 승인 후 실행 순서

```bash
export AWS_PROFILE=asklake
export AWS_ACCOUNT_ID=<account-id>
export AWS_REGION=ap-northeast-2
export GITHUB_REPOSITORY=JUNGLE-TEAM1/NMM_team1
export ECR_REPOSITORY_PREFIX=asklake
export EKS_CLUSTER_NAME=asklake-dev
export K8S_NAMESPACE=asklake-dev
export ASKLAKE_AWS_APPROVED=APPROVED

scripts/aws/check-readiness.sh
scripts/aws/render-github-oidc-trust-policy.sh > /tmp/asklake-github-oidc-trust-policy.json
scripts/aws/bootstrap-ecr.sh --execute
scripts/aws/bootstrap-eks.sh --execute
```

## GitHub Actions에 필요한 값

- Repository variable: `AWS_REGION`
- Repository variable: `AWS_ACCOUNT_ID`
- Repository variable: `ECR_REPOSITORY_PREFIX`
- Repository variable: `EKS_CLUSTER_NAME`
- Repository variable: `K8S_NAMESPACE`
- Repository secret or environment variable: `AWS_ROLE_TO_ASSUME`

## smoke와 rollback

- smoke: `kubectl -n "$K8S_NAMESPACE" rollout status deploy/asklake-backend deploy/asklake-frontend`
- smoke: `kubectl -n "$K8S_NAMESPACE" get svc,pods`
- rollback: `kubectl -n "$K8S_NAMESPACE" rollout undo deploy/asklake-backend`
- rollback: `kubectl -n "$K8S_NAMESPACE" rollout undo deploy/asklake-frontend`

## 참고한 공식 문서

- GitHub OIDC for AWS: https://docs.github.com/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services
- AWS credentials action OIDC guidance: https://github.com/aws-actions/configure-aws-credentials
- ECR create repository CLI: https://docs.aws.amazon.com/cli/latest/reference/ecr/create-repository.html
- EKS with eksctl: https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html
