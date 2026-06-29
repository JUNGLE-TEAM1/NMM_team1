# M1 Week2 final demo flow 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete, local validation passed
- Summary: M1 final demo flow 표시 보강은 완료됐다. `/catalog` query readiness와 `/query` DuckDB/evidence 상태 표시가 추가됐고 local build/route/static checks가 통과했다.

## Recommended Next Action / 권장 다음 행동

- #200/#204 merge 순서를 먼저 확인한 뒤 PR 여부를 결정한다.
- Reason: #200은 `/etl` UI를 크게 바꾸고 #204는 DuckDB runtime wiring을 담당하므로, 이 branch를 바로 PR로 열면 frontend conflict 또는 중복 review가 생길 수 있다.

## Options / 선택지

1. PR 진행: linked issue를 만들고 이 M1 polish를 별도 PR로 올린다.
2. 보류: #200/#204 merge 후 최신 main에서 최종 M1 smoke branch로 재확인한다.
3. #200에 흡수: `/etl` UI 변경 PR에 이 표시 보강을 follow-up commit으로 합칠지 사람/리뷰어가 결정한다.
4. 추가 보강: 실제 backend + browser click smoke까지 수행하고 evidence를 보강한다.

## Waiting On Human / 사람 응답 대기

- PR 진행, 보류, #200 흡수, 추가 보강 중 하나를 선택한다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "진행해"라고 지시해 M1 표시 보강을 구현했다.

## Next AI Action / 다음 AI 행동

- option 1이면 linked issue 생성, PR closing keyword 기록, 최종 validation 후 push/PR을 진행한다.
- option 2이면 `sync.md`와 `next-actions.md`에 hold reason을 남긴다.
- option 3이면 #200 branch owner/reviewer와 통합 방향을 확인한 뒤 현재 branch를 보류한다.
- option 4이면 backend/dev server를 함께 띄워 `/etl -> /catalog -> /query` browser/manual smoke를 추가 기록한다.
