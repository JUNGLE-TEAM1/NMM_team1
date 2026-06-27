# M5 Airflow integration option guide 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: M5 Airflow 실제 연결 전 선택지를 문서화했고, 사용자가 추천 조합을 채택했다. 이 결정은 `feature/m5-airflow-smoke-integration` 구현 workspace에서 소비됐다.

## Recommended Next Action / 권장 다음 행동

- M5 local/demo 마감 브랜치의 integration validation과 PR 준비를 진행한다.
- Reason: option guide 자체는 완료됐고, 남은 일은 구현 branch의 검증/리뷰/PR 정리다.

## Options / 선택지

1. combined M5 local/demo branch에서 Airflow smoke + demo cockpit UI를 함께 리뷰한다.
2. 필요하면 후속으로 M5 demo cockpit UI만 clean branch로 분리한다.
3. production Airflow/MinIO/SparkRunner는 별도 후속 Phase에서 다시 결정한다.

## Waiting On Human / 사람 응답 대기

- 없음. option guide는 완료됐고 구현 branch 검증으로 이동한다.

## Last User Choice / 마지막 사용자 선택

- 추천 조합 채택 후 전체 남은 M5 local/demo 정리 진행.

## Next AI Action / 다음 AI 행동

- combined M5 local/demo branch에서 `scripts/validate-harness.sh --integration`을 재실행하고 PR 준비 상태를 정리한다.
