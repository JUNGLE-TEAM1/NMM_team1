# M5 Airflow smoke integration 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: PR open, local checks passed after latest main sync
- Summary: local Airflow smoke 연결과 M5 demo cockpit UI가 같은 branch에 정리됐고, PR #200이 열려 있다. 최신 확인 `origin/main`(`e640f90`) 병합 뒤 local test/build/harness는 통과했으며, 남은 원격 작업은 PR body guardrail 보정과 CI 재확인이다.

## Recommended Next Action / 권장 다음 행동

- GitHub 인증을 회복한 뒤 PR #200 body에 linked issue/no-issue guardrail과 large PR exception 근거를 보정하고 CI를 재확인한다.
- Reason: 로컬 구현과 검증은 완료됐지만 remote `linked-issue`, `pr-size-hard-gate` check가 PR body 정책 때문에 실패했다.

## Options / 선택지

1. PR #200 body guardrail을 보정하고 CI를 재확인한다.
2. PR 리뷰에서 요청될 때만 Airflow smoke와 demo cockpit UI를 분리한다.
3. production Airflow/MinIO/SparkRunner/async UI는 후속 Phase로 둔다.

## Waiting On Human / 사람 응답 대기

- GitHub CLI 인증이 invalid 상태라 PR body 편집과 원격 check 재확인은 인증 회복이 필요하다.

## Last User Choice / 마지막 사용자 선택

- 추천안 구현 진행 후 남은 M5 정리 전체 진행.

## Next AI Action / 다음 AI 행동

- sync/quality/report 업데이트를 commit/push하고, 가능하면 GitHub 인증 회복 후 PR body guardrail 보정을 진행한다.
