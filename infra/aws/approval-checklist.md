# AWS resource 생성 승인 체크리스트

실제 비용이 발생하거나 IAM 권한을 바꾸는 작업은 이 체크리스트가 승인되기 전까지 실행하지 않는다.

## 배포 target 결정

- [x] 후보: EKS
- [ ] 후보: ECS/Fargate
- [ ] 후보: App Runner
- [ ] 후보: EC2
- [x] 선택한 target: EKS-ready bootstrap
- [x] 선택 이유: 기존 Kubernetes manifest와 가장 직접적으로 연결되며, ECS/App Runner는 별도 decision으로 확장 가능하다.

## 비용 확인

- [ ] 예상 월 비용을 기록했다.
- [ ] free tier 또는 학습 계정 제한을 확인했다.
- [ ] resource 삭제 명령 또는 콘솔 절차를 기록했다.

## 권한 확인

- [ ] AWS account id를 확인했다.
- [ ] region을 확인했다.
- [ ] 필요한 IAM role/policy를 최소 권한으로 정리했다.
- [x] GitHub OIDC 또는 배포 credential 방식을 정했다.

## 배포와 rollback

- [x] ECR repository 또는 image registry 전략을 정했다.
- [x] Kubernetes namespace 또는 service 환경 이름을 정했다.
- [x] smoke check 명령을 정했다.
- [x] rollback 절차를 정했다.

## 승인

- [ ] 사람 승인 전까지 실제 resource를 만들지 않는다.
- Approved by:
- Approved at:
