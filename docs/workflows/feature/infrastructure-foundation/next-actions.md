# Infrastructure foundation 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: infrastructure foundation complete
- Summary: CI/CD, Docker smoke image, Kubernetes manifest, AWS approval checklist 후보가 추가되었다.

## Recommended Next Action / 권장 다음 행동

- AWS deployment target decision을 진행한다.
- Reason: 실제 AWS resource 생성 전 EKS/ECS/App Runner/EC2 중 배포 target을 정해야 한다.

## Options / 선택지

1. EKS를 target으로 decision brief를 만든다.
2. ECS/Fargate 또는 App Runner를 대안으로 비교한다.
3. 먼저 `feature/container-app-skeleton`으로 app image를 만든다.
4. 현재 branch를 PR 준비 상태로 정리한다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- 다음 페이즈를 진행해줘.

## Next AI Action / 다음 AI 행동

- option 1이면 EKS decision brief를 `decisions.md`에 추가한다.
- option 2이면 AWS target 비교 decision brief를 작성한다.
- option 3이면 `feature/container-app-skeleton` workspace를 만든다.
- option 4이면 status summary와 검증 결과를 PR handoff 형식으로 정리한다.
