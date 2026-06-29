# M6 LLM Answer Adapter 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready-for-review
- Summary: M6 LLM answer adapter 구현, 문서 반영, local validation이 완료됐다. PR 생성은 사용자 요청 시 진행한다.

## Recommended Next Action / 권장 다음 행동

- 의미 단위 commit 후 PR 생성 여부를 확인한다.
- Reason: 구현과 검증은 완료됐고, remote push/PR 생성은 다음 자연스러운 handoff 단계다.

## Options / 선택지

1. 의미 단위 commit 후 PR을 생성한다.
2. PR 전 추가 smoke를 실행한다.
3. 구현 범위를 조정한다.
4. 이 workspace를 보류한다.

## Waiting On Human / 사람 응답 대기

- PR 진행 지시.

## Last User Choice / 마지막 사용자 선택

- 사용자가 Step 8 개발을 요청했고, 구현은 완료했다.

## Next AI Action / 다음 AI 행동

- option 1이면 의미 단위 commit을 만들고 PR-ready checks를 재확인한 뒤 push/PR 생성한다.
- option 2이면 지정 smoke를 실행하고 `quality.md`를 갱신한다.
- option 3이면 `plan.md`, `shared-docs.md`, tests를 조정한다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
