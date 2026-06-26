# M2 RuntimeConfig SparkRunner smoke 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: implementation validated locally
- Summary: `RuntimeConfig`와 `Week2SparkRunner` local Parquet smoke 구현이 끝났고 backend/harness 검증을 통과했다. 첫 PR 범위는 M2 전체 구현이 아니라 공통 runner smoke로 유지한다.

## Recommended Next Action / 권장 다음 행동

- 구현 변경을 검토한 뒤 커밋한다.
- Reason: code/test/contract sample/workspace evidence가 같은 PR 1 범위로 닫혔다.

## Options / 선택지

1. 현재 변경 커밋: M2 runner smoke 구현과 검증 증거를 한 커밋으로 묶는다.
2. PR 준비: 커밋 후 push/PR 전에 Pre-PR Human Checkpoint를 제시한다.
3. 후속 후보 정리: Taxi evidence, M5 integration, SQL smoke 중 다음 branch를 팀 dependency 기준으로 고른다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 커밋/PR/push 여부는 사람 확인이 필요하다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 `pyarrow` local smoke와 Spark 교체 가능 interface 설명을 이해한 뒤 구현 진행을 지시함 / 2026-06-26

## Next AI Action / 다음 AI 행동

- option 1이면 M2 구현 파일만 stage하고 커밋한다. untracked `pm/docs/*`는 제외한다.
- option 2이면 sync 상태 확인 후 PR 준비를 진행한다.
- option 3이면 후속 후보 중 하나를 별도 workspace로 분리한다. Taxi evidence가 반드시 두 번째 PR이라는 전제는 두지 않는다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
