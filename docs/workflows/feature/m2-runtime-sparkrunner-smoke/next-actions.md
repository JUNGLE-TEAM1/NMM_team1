# M2 RuntimeConfig SparkRunner smoke 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: workspace created
- Summary: branch workspace와 GitHub issue #131이 생성되었다. 첫 PR 범위는 M2 전체 구현이 아니라 `RuntimeConfig` + `SparkRunner` smoke로 제한한다.

## Recommended Next Action / 권장 다음 행동

- `RuntimeConfig` 최소 shape와 `SparkRunner` read/write smoke부터 구현한다.
- Reason: M2 구현을 Taxi 전용 ETL로 키우지 않고 데이터셋 독립 공통 실행기부터 검증해야 한다.

## Options / 선택지

1. PR 1 진행: `RuntimeConfig` + `SparkRunner` smoke 구현.
2. PR 1 범위 수정: 구현 전에 plan을 더 줄이거나 조정.
3. 후속 후보 정리: Taxi evidence, M5 integration, SQL smoke 중 다음 branch를 팀 dependency 기준으로 고른다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 구현 시작 전 최종 Scope Confirm이 필요하다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 새 이슈/브랜치/workspace 생성을 지시함 / 2026-06-26

## Next AI Action / 다음 AI 행동

- option 1이면 `confirmations.md`를 업데이트하고 `RuntimeConfig`/`SparkRunner` 구현을 시작한다.
- option 2이면 `plan.md`와 `shared-docs.md`를 업데이트한다.
- option 3이면 후속 후보 중 하나를 별도 workspace로 분리한다. Taxi evidence가 반드시 두 번째 PR이라는 전제는 두지 않는다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
