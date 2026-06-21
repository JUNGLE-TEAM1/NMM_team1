# Infrastructure foundation 노트

## 진행 메모

- CI workflow는 harness validation, smoke image build, Kubernetes manifest shape check로 시작한다.
- `deploy-dev.example.yml`은 실제 배포가 아니라 approval gate 예시다.
- backend/frontend Dockerfile은 제품 코드가 생기기 전 smoke image로 동작한다.
- Kubernetes manifest는 `asklake-dev` namespace와 backend/frontend deployment/service 후보를 둔다.
- AWS checklist는 실제 resource 생성 전 비용, IAM, rollback, smoke를 확인하도록 한다.

## 결정

- 실제 AWS resource는 이번 Phase에서 만들지 않는다.
- AWS deploy target은 EKS, ECS/Fargate, App Runner, EC2 중 다음 decision으로 남긴다.
- secret 값은 `.env.example`과 GitHub Secrets 이름만 기록하고 실제 값은 commit하지 않는다.

## 열린 질문

- AWS target을 EKS로 확정할지, ECS/Fargate 또는 App Runner로 단순화할지 결정해야 한다.
- image registry를 AWS ECR로 할지 GitHub Container Registry로 할지 결정해야 한다.
- Helm chart로 갈지 plain manifest/kustomize로 시작할지 결정해야 한다.

## 링크 / 증거

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-dev.example.yml`
- `infra/docker/backend.Dockerfile`
- `infra/docker/frontend.Dockerfile`
- `infra/k8s/base/`
- `infra/aws/approval-checklist.md`
- `.env.example`
