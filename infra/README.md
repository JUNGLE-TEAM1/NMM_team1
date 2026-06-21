# AskLake 인프라 foundation

이 폴더는 제품 기능 구현 전에 합의할 CI/CD, Docker, Kubernetes, AWS foundation 산출물을 담는다.

## 원칙

- 실제 AWS 비용이 발생하는 resource는 사람 승인 없이 만들지 않는다.
- secret 값은 repository에 commit하지 않는다.
- local/container smoke가 실패하면 cloud deploy를 진행하지 않는다.
- Docker image tag는 commit sha 또는 명시적 version을 사용한다.
- Kubernetes manifest에는 실제 secret 값을 넣지 않는다.

## 현재 산출물

- `infra/docker/backend.Dockerfile`: backend smoke image 후보
- `infra/docker/frontend.Dockerfile`: frontend smoke image 후보
- `infra/k8s/base/`: namespace, deployment, service manifest 후보
- `infra/aws/approval-checklist.md`: AWS resource 생성 전 승인 체크리스트

## 다음 Phase에서 교체할 것

- smoke image를 실제 React/FastAPI app image로 교체
- 환경별 values 또는 overlay 추가
- ECR/EKS/ECS/App Runner 중 실제 AWS target 결정

