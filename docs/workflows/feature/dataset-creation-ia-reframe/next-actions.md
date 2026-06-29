# Dataset creation IA reframe 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: R-1 implemented locally
- Summary: `/dataset` 생성 entry가 External Connection / Source Dataset / Target Dataset 3개 선택지로 재정의되었다.

## Recommended Next Action / 권장 다음 행동

- 다음 Phase인 `feature/external-connection-create-wizard`로 진행한다.
- Reason: R-1은 입구 구조만 바로잡았고, External Connection 상세 wizard는 R-2 범위로 남아 있다.

## Options / 선택지

1. `feature/external-connection-create-wizard` 구현을 시작한다.
2. R-1 화면 copy/layout을 추가 보정한다.
3. Source Dataset 내부 flow 보정을 먼저 당긴다.
4. PR 정리를 먼저 진행한다.

## Waiting On Human / 사람 응답 대기

- 다음 Phase 진행 여부 또는 R-1 추가 수정 여부.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "페이즈를 진행해줘"라고 지시해 R-1 구현을 진행.

## Next AI Action / 다음 AI 행동

- option 1이면 R-2 workspace 범위로 External Connection wizard를 구현한다.
- option 2이면 R-1 branch에서 entry copy/layout을 조정하고 재검증한다.
- option 3이면 현재 Phase 순서 변경을 `docs/08`과 해당 workspace에 기록한 뒤 진행한다.
- option 4이면 현재 branch 변경만 PR에 정리할지 확인한다.
