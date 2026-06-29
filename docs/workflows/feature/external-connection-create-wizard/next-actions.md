# External connection create wizard 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: R-2 implemented locally
- Summary: External Connection 생성 3단계 wizard가 구현/검증되었다.

## Recommended Next Action / 권장 다음 행동

- 다음 Phase인 `feature/source-dataset-from-connection-wizard`로 진행한다.
- Reason: External Connection draft가 생겼으므로 Source Dataset 생성 흐름을 등록된 연결 기반으로 보정할 차례다.

## Options / 선택지

1. `feature/source-dataset-from-connection-wizard` 구현을 시작한다.
2. External Connection wizard copy/layout을 추가 보정한다.
3. PR 정리를 먼저 진행한다.
4. Source/Target 전체 시나리오를 다시 검수한다.

## Waiting On Human / 사람 응답 대기

- 다음 Phase 진행 여부 또는 R-2 추가 수정 여부.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "페이즈 진행해줘"라고 지시해 R-2 구현을 진행.

## Next AI Action / 다음 AI 행동

- option 1이면 R-3 workspace 범위로 Source Dataset wizard를 External Connection 기반으로 보정한다.
- option 2이면 R-2 branch에서 copy/layout을 조정하고 재검증한다.
- option 3이면 현재 branch 변경을 정리하고 PR body/문서 sync를 확인한다.
- option 4이면 현재 화면과 시나리오 일치 여부를 검수한다.
