# M5 Airflow smoke integration 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: combined M5 local/demo ready-for-review
- Summary: local Airflow smoke 연결이 구현됐고, 실제 Airflow DAG run `run_reviews_demo_065`가 성공했다. 같은 branch에 M5 demo cockpit UI까지 포함해 M5 local/demo 마감 PR 후보로 정리한다.

## Recommended Next Action / 권장 다음 행동

- final local validation을 재실행하고 combined M5 local/demo PR 준비를 진행한다.
- Reason: 사용자가 남은 M5 정리를 모두 진행하도록 지시했고, 현재 branch는 Airflow smoke와 demo cockpit UI를 함께 담고 있다.

## Options / 선택지

1. combined M5 local/demo PR을 준비한다.
2. PR 리뷰에서 요청될 때만 Airflow smoke와 demo cockpit UI를 분리한다.
3. production Airflow/MinIO/SparkRunner/async UI는 후속 Phase로 둔다.

## Waiting On Human / 사람 응답 대기

- 없음. final local validation과 PR 준비로 진행한다.

## Last User Choice / 마지막 사용자 선택

- 추천안 구현 진행 후 남은 M5 정리 전체 진행.

## Next AI Action / 다음 AI 행동

- final local checks, integration validation, staging/commit, push/PR 준비를 순서대로 진행한다.
