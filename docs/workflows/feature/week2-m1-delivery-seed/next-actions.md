# Week2 M1 delivery synthetic auxiliary seed 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: Ready for review
- Summary: delivery seed 생성 스크립트와 테스트를 추가했고, local ignored JSONL/Parquet 산출물과 metadata 검증을 완료했으며 M5/M6 handoff notes를 작성했다.

## Recommended Next Action / 권장 다음 행동

- script/docs/test/handoff 변경을 commit하고 PR을 생성한다.
- Reason: generated `data/`는 commit하지 않고, 재생성 가능한 코드와 검증 증거만 PR 대상이다.

## Options / 선택지

1. 변경 파일을 검토한 뒤 commit/push/PR을 진행한다.
2. repo에 Parquet reader dependency를 공식 추가할지 별도 Phase로 판단한다.
3. M5/M6에 delivery seed handoff를 보내고 소비 계약을 확인한다.
4. Taxi source month 또는 row limit을 바꿔 재생성한다.

## Waiting On Human / 사람 응답 대기

- 사용자가 진행을 요청함.

## Last User Choice / 마지막 사용자 선택

- "좋아 진행해", 2026-06-27

## Next AI Action / 다음 AI 행동

- option 1이면 `git status`, focused test, strict harness를 재확인하고 PR 준비를 진행한다.
- option 2이면 dependency scope를 Decision Option Brief로 분리한다.
- option 3이면 handoff 질문과 산출물 요약을 작성한다.
- option 4이면 source URL/파일명/checksum과 generation summary를 새 입력 기준으로 갱신한다.
