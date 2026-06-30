# Multi-source Target Dataset 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: local validation passed
- Summary: PR 2 multi-source Target Dataset metadata/UI slice 구현과 focused validation이 완료됐다.

## Recommended Next Action / 권장 다음 행동

- `scripts/validate-harness.sh --strict`와 PR sync check를 통과한 뒤 feature branch push와 PR 생성을 진행한다.
- Reason: local backend tests와 frontend build는 통과했고, 하네스 완료 gate만 남았다.

## Options / 선택지

1. PR 생성까지 진행한다.
2. 로컬에만 보류한다.
3. 범위를 줄이거나 일부 파일을 제외한다.
4. 추가 수동 브라우저 smoke를 먼저 수행한다.

## Waiting On Human / 사람 응답 대기

- PR-ready 자동화 조건 확인.

## Last User Choice / 마지막 사용자 선택

- user: PR 2 진행 지시.

## Next AI Action / 다음 AI 행동

- option 1이면 strict validation, PR sync check, push, PR 생성.
- option 2이면 `sync.md`에 PR deferral reason 기록.
- option 3이면 포함/제외 파일을 정리하고 validation 재실행.
- option 4이면 dev server/browser smoke 후 결과를 `quality.md`에 추가.
