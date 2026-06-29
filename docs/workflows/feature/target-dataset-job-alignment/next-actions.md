# Target dataset job alignment 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: R-4 implemented locally
- Summary: Target Dataset wizard가 Source Dataset 기반 target dataset + ETL job definition 흐름으로 정렬되었다.

## Recommended Next Action / 권장 다음 행동

- 전체 R-* 흐름을 검수하거나 PR 정리를 진행한다.
- Reason: R-1부터 R-4까지 구현/검증이 끝났고 남은 것은 통합 검수와 PR 상태 정리다.

## Options / 선택지

1. 전체 데이터셋 생성 시나리오를 브라우저로 검수한다.
2. PR 정리를 진행한다.
3. 추가 copy/layout 보정을 한다.
4. backend persistence/API Phase를 새로 설계한다.

## Waiting On Human / 사람 응답 대기

- 다음 행동 선택.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "페이즈 진행해줘"라고 지시해 R-4 구현을 진행.

## Next AI Action / 다음 AI 행동

- option 1이면 External Connection, Source Dataset, Target Dataset 흐름을 연속 smoke로 검수한다.
- option 2이면 변경 범위를 정리하고 PR body/commit/push 상태를 확인한다.
- option 3이면 R-4 branch에서 copy/layout을 조정하고 재검증한다.
- option 4이면 새 Phase 문서를 생성한다.
