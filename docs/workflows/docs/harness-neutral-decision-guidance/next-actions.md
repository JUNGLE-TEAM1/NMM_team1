# Harness neutral decision guidance 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: PR-ready
- Summary: AI 답변 중립성, 반대 관점, 추천도, 제안자 책임, 협업 감정 비용 기준을 사용 가이드/FAQ/checklist/report에 반영했다.

## Recommended Next Action / 권장 다음 행동

- local validation 통과 후 feature branch push와 PR 생성을 진행한다.
- Reason: 문서-only 변경이며 Source of Truth 규칙, runtime code, PR merge 정책 자체를 변경하지 않는다.

## Options / 선택지

1. PR을 생성하고 리뷰를 요청한다.
2. 표현 강도를 더 낮추거나 예시를 줄인 뒤 PR을 생성한다.
3. 이 원칙을 Source of Truth workflow 문서로 승격할지 별도 Phase 후보로 남긴다.
4. 이 workspace를 보류한다.

## Waiting On Human / 사람 응답 대기

- PR 생성 후 review/merge/finalize는 사람 확인을 기다린다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 기존 PR merge 후 이 큰 원칙은 별도 PR로 진행하라고 지시함.

## Next AI Action / 다음 AI 행동

- option 1이면 branch push와 PR 생성을 진행한다.
- option 2이면 사용 가이드 표현을 조정하고 재검증한다.
- option 3이면 다음 Phase 후보로 `next-actions.md` 또는 report에 남긴다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
