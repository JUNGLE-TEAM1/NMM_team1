# Auto PR creation policy 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: implementation complete, validation pending
- Summary: 자동 PR 생성 정책 문서와 helper/status/validation/test harness 수정이 적용됐다. 최종 local harness 검증과 report 작성이 남았다.

## Recommended Next Action / 권장 다음 행동

- local harness 검증을 완료하고 결과를 `quality.md`, `sync.md`, `report.md`에 기록한다.
- Reason: harness behavior 변경이므로 regression fixture와 strict validation 증거가 필요하다.

## Options / 선택지

1. local validation 완료 후 현재 변경을 유지한다.
2. 검증 실패 시 실패 원인을 수정하고 재검증한다.
3. 실제 PR 생성은 dirty worktree 포함/제외 범위를 별도 확인한 뒤 진행한다.
4. 정책 변경을 보류하려면 follow-up에서 revert/adjust 후보를 검토한다.

## Waiting On Human / 사람 응답 대기

- 없음. 현재는 검증 실행 대기.

## Last User Choice / 마지막 사용자 선택

- 사용자 선택: 진행.

## Next AI Action / 다음 AI 행동

- validation 통과 시 final report와 최종 응답을 작성한다.
- validation 실패 시 관련 문서/스크립트/fixture를 수정하고 재실행한다.
