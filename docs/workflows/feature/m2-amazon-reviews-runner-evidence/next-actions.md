# M2 Amazon Reviews JSONL runner evidence 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: local validation passed
- Summary: Amazon Reviews JSONL을 `Week2SparkRunner`로 실행하는 evidence script와 focused test가 추가됐다. 기본 sample과 M1 synthetic raw 10,000행 기준 Parquet output과 row count/bytes/duration 증거를 확인했다.

## Recommended Next Action / 권장 다음 행동

- 변경 범위를 확인한 뒤 커밋하고 PR을 올린다.
- Reason: 구현, local validation, GitHub Project 연결은 끝났고, 남은 것은 PR 생성이다.

## Options / 선택지

1. 현재 변경을 커밋하고 PR을 올린다.
2. 이번 branch를 멈추고 Taxi 또는 SQL smoke로 전환한다.

## Waiting On Human / 사람 응답 대기

- PR/push는 사람 확인 없이 실행하지 않는다. 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 Amazon Reviews 우선 evidence 방향으로 진행하라고 지시했다.

## Next AI Action / 다음 AI 행동

- option 1이면 이번 branch 변경만 stage/commit하고 PR body에 `Closes #158`를 포함한다.
- option 2이면 현재 변경을 커밋하지 않고 pause reason을 `notes.md`에 기록한다.
