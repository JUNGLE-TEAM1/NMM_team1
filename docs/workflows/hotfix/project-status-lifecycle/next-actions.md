# Project status lifecycle 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: implemented, validation pending
- Summary: Project status lifecycle 규칙과 스크립트 보강은 반영됐고, final validation 후 PR-ready 여부를 판단한다.

## Recommended Next Action / 권장 다음 행동

- final validation을 실행하고 통과하면 `scripts/prepare-pr.sh --auto-pr docs/workflows/hotfix/project-status-lifecycle`로 PR을 생성한다.
- Reason: PR-ready 조건을 통과한 하네스 운영 규칙 변경은 자동 PR 대상이다.

## Options / 선택지

1. 자동 PR 생성까지 진행한다.
2. 추가 보강 후 재검증한다.
3. PR 생성을 보류하고 재개 조건을 기록한다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- final validation 결과.

## Last User Choice / 마지막 사용자 선택

- 사용자 요청: "프롬프트를 적용해줘"

## Next AI Action / 다음 AI 행동

- option 1이면 final validation 후 자동 PR 생성.
- option 2이면 보강 범위를 `plan.md`와 `notes.md`에 기록.
- option 3이면 `sync.md`와 `next-actions.md`에 deferral reason 기록.
- option 4이면 pause reason을 `notes.md`에 기록.
