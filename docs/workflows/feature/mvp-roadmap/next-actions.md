# XFlow 참고 MVP 로드맵 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready for next implementation Phase
- Summary: 인프라 선행 원칙, XFlow 참고 MVP, M0~M5 MVP milestone, M6~M15 장기 구현 milestone이 Source of Truth에 반영되었다.

## Recommended Next Action / 권장 다음 행동

- `feature/infrastructure-foundation` Phase를 시작한다.
- Reason: 팀이 CI/CD, Docker, Kubernetes, AWS 기반을 먼저 세팅하고 개발을 시작하기로 했기 때문이다.

## Options / 선택지

1. `feature/infrastructure-foundation`을 시작한다.
2. AWS 배포 대상을 EKS/ECS/App Runner 중 먼저 결정한다.
3. 첫 source type과 metadata store를 먼저 결정한다.
4. M6 이후 장기 milestone 우선순위를 재정렬한다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- CI/CD, Docker, Kubernetes, AWS를 먼저 세팅하고 개발을 시작하고 싶다.

## Next AI Action / 다음 AI 행동

- option 1이면 `scripts/start-workflow.sh feature infrastructure-foundation "Infrastructure foundation"`으로 다음 workspace를 만든다.
- option 2이면 `docs/02`와 `decisions.md`에 AWS target decision brief를 만든다.
- option 3이면 `docs/01`의 열린 질문과 `decisions.md`를 갱신한다.
- option 4이면 장기 roadmap 조정 Phase 또는 decision brief를 만든다.
