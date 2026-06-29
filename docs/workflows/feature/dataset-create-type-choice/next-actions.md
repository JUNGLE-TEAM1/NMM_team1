# Dataset create type choice 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: implemented
- Summary: `데이터셋 생성` CTA에서 Source Dataset / Target Dataset 선택 modal로 들어가는 Phase가 구현/검증되었다.

## Recommended Next Action / 권장 다음 행동

- 다음 Phase를 선택한다.
- Reason: 생성 유형 분기는 준비되었고, 이제 Source Dataset wizard 또는 Target Dataset wizard 중 하나를 구체화할 수 있다.

## Options / 선택지

1. `feature/source-dataset-create-wizard` 구현을 시작한다.
2. `feature/target-dataset-create-wizard-reframe` 구현을 시작한다.
3. 선택 modal copy나 선택지 구조를 보정한다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 다음 구현 우선순위 확인을 기다린다.

## Last User Choice / 마지막 사용자 선택

- 

## Next AI Action / 다음 AI 행동

- option 1이면 `feature/source-dataset-create-wizard` 범위로 이동한다.
- option 2이면 `feature/target-dataset-create-wizard-reframe` 범위로 이동한다.
- option 3이면 copy 보정 후 재검증한다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
