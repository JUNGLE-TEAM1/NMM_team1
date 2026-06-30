# Frontend SourcesPage decomposition 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: Phase 2 local validation passed
- Summary: `SourcesPage`를 dataset feature boundary로 이동했고, `App.jsx`는 route shell/top-level pages 중심으로 축소했다. build/static/browser smoke는 통과했다.

## Recommended Next Action / 권장 다음 행동

- Phase 3 후보로 `SourcesPage.jsx` 내부를 constants/hooks/view sections/modals 단위로 추가 분해한다.
- Reason: `App.jsx`의 가장 큰 덩어리는 분리됐지만 `SourcesPage.jsx`가 아직 5526 lines라서 사람과 AI가 읽기 좋은 구조까지는 한 단계 더 필요하다.

## Options / 선택지

1. Phase 3: `SourcesPage` 내부 상태/효과를 hooks와 feature helpers로 분리한다.
2. Phase 4: dataset modal/list/view section을 더 작은 presentational components로 분리한다.
3. Phase 5: frontend smoke/test harness를 추가해 route별 runtime import 누락을 자동으로 잡는다.
4. PR 준비: 현재 Phase 1+2 branch 상태를 push/PR로 올리기 전에 Pre-PR Human Checkpoint를 진행한다.

## Waiting On Human / 사람 응답 대기

- Phase 규칙상 다음 구현은 새 Phase로 진행한다. 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "전부 진행하세요"라고 지시했지만, 저장소 규칙 `작업 하나 = Phase 하나`에 따라 이번 실행은 Phase 2까지만 진행했다.

## Next AI Action / 다음 AI 행동

- option 1이면 새 branch workspace를 만들고 `SourcesPage` hook/helper 분리 계획을 먼저 기록한다.
- option 2이면 presentational component split을 별도 Phase로 시작한다.
- option 3이면 최소 route smoke 자동화 범위를 계획하고 구현한다.
- option 4이면 PR-ready 조건과 human checkpoint를 점검한다.
