# Structure refactor 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready for PR
- Summary: 구조 리팩토링 구현과 local 검증이 완료되었다. PR 전 sync와 PR 생성/CI 확인이 남았다.

## Recommended Next Action / 권장 다음 행동

- PR 준비를 진행한다.
- Reason: API client/hook/component/transform boundary 정리가 완료되고 smoke가 통과했다.

## Options / 선택지

1. PR 진행: pre-merge sync, push, PR 생성, CI 확인, merge/finalize/cleanup까지 진행한다.
2. 추가 보강: SQLiteMetadataStore repository split을 추가한다. 현재는 churn이 커서 비추천.
3. 다음 Phase 선택: 외부 demo frontend integration, M6 source connector, M7 transform library 중 우선순위를 고른다.
4. 보류: 현재 branch를 유지하고 추가 지시를 기다린다.

## Waiting On Human / 사람 응답 대기

- PR 생성/merge 같은 원격 상태 변경은 사람의 명시 지시가 필요하다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "진행해"라고 지시.

## Next AI Action / 다음 AI 행동

- option 1이면 `scripts/prepare-pr.sh --auto-pr docs/workflows/feature/structure-refactor`로 PR 준비를 진행한다.
- option 2이면 store split 범위를 `plan.md`에 추가하고 검증을 재실행한다.
- option 3이면 이 branch를 먼저 PR-ready 상태로 두고 다음 workspace를 만든다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
