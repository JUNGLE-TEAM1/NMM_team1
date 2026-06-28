# M2 product health runtime smoke 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: in-progress
- Summary: M2 `Week2SparkRunner`가 product health 대표 경로의 4개 source input을 pass-through Parquet output과 source별 evidence로 남길 수 있게 구현 중이다.

## Recommended Next Action / 권장 다음 행동

- 이번 PR 검증/PR 생성까지 진행한다.
- Reason: focused test와 CLI smoke는 통과했고, full backend/harness 검증이 남았다.

## Options / 선택지

1. 이번 PR 검증/PR 생성까지 진행한다.
2. M3 L6 TransformSpec fixture가 들어온 뒤 실제 transform integration Phase를 연다.
3. Docker Spark cluster와 5GB input evidence를 별도 M2 scale Phase로 연다.

## Waiting On Human / 사람 응답 대기

- 없음.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "그래 진행하자."라고 지시했다.

## Next AI Action / 다음 AI 행동

- local validation, pre-PR sync, commit, PR 준비를 진행한다.
