# Data integration transform output preview 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: locally verified
- Summary: Transform 단계에 선택 field 기반 output schema preview를 추가했다.

## Recommended Next Action / 권장 다음 행동

- 사람 demo 확인 후 Review & Run Phase로 이동한다.
- Reason: Source, Transform output preview, Target name까지 wizard 입력 흐름이 이어졌고 다음 자연스러운 단계는 실행 전 검토와 run 연결이다.

## Options / 선택지

1. 현재 Transform output preview를 사람 눈으로 확인한다.
2. 다음 Phase로 Review & Run 최소 연결을 진행한다.
3. Transform preview copy나 layout을 수정한다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- demo 화면 확인과 다음 Phase 선택.

## Last User Choice / 마지막 사용자 선택

- "진행해"

## Next AI Action / 다음 AI 행동

- option 1이면 사용자 피드백을 현재 Phase 문서나 다음 Phase plan에 반영한다.
- option 2이면 `feature/data-integration-review-run-step` 구현으로 진행한다.
- option 3이면 현재 Transform preview UI를 수정한다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
