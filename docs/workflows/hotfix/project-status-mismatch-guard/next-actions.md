# Project status mismatch guard 다음 행동

## 추천

1. 변경 diff와 검증 결과를 리뷰한다.
2. PR을 만들 경우 `scripts/prepare-pr.sh --check-pr-sync docs/workflows/hotfix/project-status-mismatch-guard`를 먼저 확인한다.
3. PR 생성 후 merge/finalize/cleanup은 Pre-PR Human Checkpoint에서 별도 승인한다.

## 운영 보정 후보

- GitHub Project automation 설정에서 closed issue가 `Ready`로 되돌아가지 않도록 조건을 확인한다.
- Issue `#83` Project Status는 사람이 승인하면 `Done`으로 수동 정렬하거나 `scripts/prepare-pr.sh --finalize docs/workflows/hotfix/remote-reconciliation-auto-pr`를 재실행한다.
