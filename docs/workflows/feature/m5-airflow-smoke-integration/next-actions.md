# M5 Airflow smoke integration 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: PR open, local checks passed after latest main sync
- Summary: local Airflow smoke 연결과 M5 demo cockpit UI가 같은 branch에 정리됐고, PR #200이 열려 있다. 최신 확인 `origin/main`(`e640f90`) 병합 뒤 local test/build/harness는 통과했으며, PR body는 `Closes #202`와 `Large PR Exception: approved`로 보정했다.

## Recommended Next Action / 권장 다음 행동

- PR #200 remote CI recheck를 확인하고, 통과하면 merge/finalize/cleanup은 사람 확인 뒤 진행한다.
- Reason: 로컬 구현과 검증, PR body guardrail 보정은 완료됐고 remote check 결과 확인만 남았다.

## Options / 선택지

1. PR #200 remote CI recheck를 확인한다.
2. PR 리뷰에서 요청될 때만 Airflow smoke와 demo cockpit UI를 분리한다.
3. production Airflow/MinIO/SparkRunner/async UI는 후속 Phase로 둔다.

## Waiting On Human / 사람 응답 대기

- merge/finalize/cleanup은 사람 확인 전 실행하지 않는다.

## Last User Choice / 마지막 사용자 선택

- 추천안 구현 진행 후 남은 M5 정리 전체 진행.

## Next AI Action / 다음 AI 행동

- sync/quality/report 업데이트를 commit/push하고 remote CI recheck를 확인한다.
