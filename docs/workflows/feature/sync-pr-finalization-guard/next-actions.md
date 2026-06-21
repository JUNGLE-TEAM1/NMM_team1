# Sync PR finalization guard 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: workspace created
- Summary: branch workspace는 생성되었고, scope는 아직 사람 확인이 필요하다.

## Recommended Next Action / 권장 다음 행동

- Scope Confirm을 요청한다.
- Reason: branch/workspace, 포함 범위, 제외 범위, 영향받는 문서가 명확해지기 전에는 구현을 시작하지 않는다.

## Options / 선택지

1. 범위를 확인하고 Contract Confirm으로 진행한다.
2. 구현 전에 범위를 수정한다.
3. 일부 작업을 다른 branch로 분리한다.
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
