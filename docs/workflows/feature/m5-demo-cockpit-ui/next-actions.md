# M5 demo cockpit UI 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: combined M5 local/demo ready-for-review
- Summary: `/etl` M5 demo cockpit UI를 4개 필수 질문 중심 학습 흐름으로 다시 구성했고, 짧은 사용 guide를 작성했다. 현재 branch에서는 M5 Airflow smoke와 함께 M5 local/demo 마감 PR 후보로 정리한다.

## Recommended Next Action / 권장 다음 행동

- final local validation을 재실행하고 combined M5 local/demo PR 준비를 진행한다.
- Reason: 사용자가 남은 M5 정리를 모두 진행하도록 지시했고, UI 변경은 Airflow smoke evidence를 학습/시연하는 M5 마감 범위에 포함된다.

## Options / 선택지

1. combined M5 local/demo PR을 준비한다.
2. PR 리뷰에서 요청될 때만 clean branch 분리를 진행한다.
3. `/catalog` live detail polish 또는 M6 query evidence 연결은 다음 Phase로 둔다.

## Waiting On Human / 사람 응답 대기

- 없음. final local validation과 PR 준비로 진행한다.

## Last User Choice / 마지막 사용자 선택

- 결과 이해까지 가능한 M5 demo page 구현 후 남은 M5 정리 전체 진행.

## Next AI Action / 다음 AI 행동

- final local checks, browser smoke 가능 여부 확인, integration validation, staging/commit, push/PR 준비를 순서대로 진행한다.
