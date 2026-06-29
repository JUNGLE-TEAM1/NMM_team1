# Source dataset from connection wizard 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: R-3 implemented locally
- Summary: Source Dataset 생성 wizard가 External Connection 기반 raw/source dataset 생성 흐름으로 보정되었다.

## Recommended Next Action / 권장 다음 행동

- 다음 Phase인 `feature/target-dataset-job-alignment`로 진행한다.
- Reason: Source Dataset 생성 구조가 정리되었으므로 Target Dataset의 ETL job definition copy/review를 맞출 차례다.

## Options / 선택지

1. `feature/target-dataset-job-alignment` 구현을 시작한다.
2. Source Dataset wizard copy/layout을 추가 보정한다.
3. PR 정리를 먼저 진행한다.
4. 전체 데이터셋 생성 시나리오를 검수한다.

## Waiting On Human / 사람 응답 대기

- 다음 Phase 진행 여부 또는 R-3 추가 수정 여부.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "페이즈 진행해줘"라고 지시해 R-3 구현을 진행.

## Next AI Action / 다음 AI 행동

- option 1이면 R-4 workspace 범위로 Target Dataset wizard를 ETL job definition 중심으로 정렬한다.
- option 2이면 R-3 branch에서 copy/layout을 조정하고 재검증한다.
- option 3이면 현재 branch 변경을 정리하고 PR body/문서 sync를 확인한다.
- option 4이면 화면과 시나리오 일치 여부를 검수한다.
