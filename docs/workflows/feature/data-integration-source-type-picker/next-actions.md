# Data integration source type picker 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: locally verified
- Summary: 데이터 통합 Source 시작 모달을 XFlow식 source type picker + dataset card selector로 보정했다.

## Recommended Next Action / 권장 다음 행동

- 사람 demo 확인 후 다음 작은 Phase를 고른다.
- Reason: 이번 Phase는 local build/harness/browser smoke를 통과했고, 실제 connector/API 연결은 아직 범위 밖이다.

## Options / 선택지

1. 현재 source type picker UI를 사람 눈으로 확인한다.
2. 다음 Phase로 Transform step의 최소 카드/필드 선택 UI를 추가한다.
3. Source connector 연결 Phase를 따로 만들어 실제 CSV/Kafka/API 입력 흐름을 설계한다.
4. 이번 보정 UI에서 type taxonomy나 fixture dataset 이름을 수정한다.

## Waiting On Human / 사람 응답 대기

- demo 화면 확인과 다음 Phase 선택.

## Last User Choice / 마지막 사용자 선택

- "보정 페이즈를 진행해줘"

## Next AI Action / 다음 AI 행동

- option 1이면 사용자 피드백을 `confirmations.md` 또는 다음 Phase plan에 반영한다.
- option 2이면 Transform step workspace로 진행한다.
- option 3이면 Source connector 연결 workspace를 생성한다.
- option 4이면 현재 Phase에서 UI fixture를 수정한다.
