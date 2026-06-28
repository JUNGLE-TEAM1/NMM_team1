# M1 query route trace UI 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete, PR-ready after final validation
- Summary: M1 `/query` 화면이 M6 `AIQueryResult.route`와 `retrieval_trace[]`를 표시한다. SQL route와 unsupported route를 성공처럼 섞어 보이지 않게 분리했다.

## Recommended Next Action / 권장 다음 행동

- PR을 생성하고 review/CI를 확인한다.
- Reason: local build, API/browser smoke, strict harness validation이 통과했고 linked issue #240이 열려 있다.

## Options / 선택지

1. PR 생성 후 CI/check를 확인한다.
2. PR review에서 UI copy나 spacing만 보강한다.
3. 다음 M1 Phase로 Product Health readiness UI를 진행한다.
4. `/etl`의 `Catalog detail` CTA를 `/catalog`로 연결하는 작은 UI fix를 별도 Phase로 진행한다.

## Waiting On Human / 사람 응답 대기

- PR merge/finalize/branch cleanup은 사람 확인 후 진행한다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "다음 페이즈를 수행해줘"라고 지시해 Phase 7을 구현했다.

## Next AI Action / 다음 AI 행동

- PR 생성 후 원격 CI/check 상태를 확인한다.
