# M1 product health readiness UI 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: draft, scope proposed
- Summary: M1 후속 Phase 8로 생성됐다. `dataset_product_health_gold` 준비/미준비 상태를 fake success 없이 보여주는 UI Phase다.

## Recommended Next Action / 권장 다음 행동

- Phase 6 browser smoke와 Phase 7 route/trace 표시 이후 진행한다.
- Reason: Gold 준비 상태와 query route 상태를 함께 보아야 화면 문구가 정확해진다.

## Options / 선택지

1. Phase 6/7 이후 이 Phase를 구현한다.
2. Gold readiness만 먼저 구현한다.
3. readiness panel Phase와 합친다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

-

## Next AI Action / 다음 AI 행동

- option 1이면 `confirmations.md`를 업데이트하고 공유 contract를 초안 작성 또는 확인한다.
- option 2이면 `plan.md`와 `shared-docs.md`를 업데이트한다.
- option 3이면 `scripts/start-workflow.sh`로 다른 workspace를 만든다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
