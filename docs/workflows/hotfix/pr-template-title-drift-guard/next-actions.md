# PR 템플릿 제목 drift guard 보강 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete + PR-ready
- Summary: PR 제목/본문 drift guard 보강과 local validation이 완료됐다.

## Recommended Next Action / 권장 다음 행동

- PR을 생성한다.
- Reason: 하네스 변경, 문서 반영, 회귀 검증, strict validation이 완료됐다.

## Options / 선택지

1. PR 생성 후 CI/check를 확인한다.
2. 추가 보강이 필요하면 현재 branch에 후속 커밋한다.
3. PR 생성은 보류하고 재개 조건을 기록한다.
4. 이 Hotfix를 중단한다.

## Waiting On Human / 사람 응답 대기

- PR 생성 후 merge/finalize/cleanup은 사람 명시 지시 전까지 보류한다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "프롬프트를 적용해줘"라고 지시함.

## Next AI Action / 다음 AI 행동

- option 1이면 final validation 후 `scripts/prepare-pr.sh --auto-pr docs/workflows/hotfix/pr-template-title-drift-guard`를 실행한다.
- option 2이면 scope 안에서 보강하고 quality/report를 갱신한다.
- option 3이면 `sync.md`와 `next-actions.md`에 보류 사유를 기록한다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
