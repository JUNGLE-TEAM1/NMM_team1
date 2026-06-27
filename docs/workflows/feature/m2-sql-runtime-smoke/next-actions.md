# M2 SQL runtime smoke 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready-for-review
- Summary: DuckDB-backed SQL runtime smoke 구현, local validation, PR 생성은 완료했다. CI 확인이 남았다.

## Recommended Next Action / 권장 다음 행동

- PR CI를 확인한다.
- Reason: local focused/full tests, smoke script, strict harness가 통과했다.

## Options / 선택지

1. PR CI를 확인하고 필요하면 수정한다.
2. 기본 API engine을 `duckdb`로 전환하는 범위까지 확장한다.
3. 여기서 멈추고 구현 내용을 리뷰한다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 현재는 option 1로 진행 가능하다.

## Last User Choice / 마지막 사용자 선택

- user: `다음 사항 진행하자`

## Next AI Action / 다음 AI 행동

- option 1이면 PR checks를 확인하고 실패 시 로그를 보고 수정한다.
- option 2이면 `decisions.md`를 다시 열고 M6 default switch 영향을 확인한다.
- option 3이면 현재 diff를 설명하고 멈춘다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
