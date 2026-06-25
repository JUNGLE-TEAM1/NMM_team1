# Project status mismatch guard 계획

- Branch: `hotfix/project-status-mismatch-guard`
- Workspace: `docs/workflows/hotfix/project-status-mismatch-guard`
- Type: Hotfix
- Status: complete

## 목표

- PR이 `MERGED`이고 linked issue가 `CLOSED`인데 GitHub Project Status가 `Done`이 아닌 상태를 lifecycle mismatch로 탐지한다.
- 자동보정 범위는 넓히지 않고, 사람 승인 후 `scripts/prepare-pr.sh --finalize <workspace>` 재실행 또는 GitHub Project UI 수동 정렬을 안내한다.
- 이미 완료된 evidence-only PR이 닫힌 issue를 다시 cross-reference해 Project automation이 `Ready`로 되돌리는 재발 가능성을 줄인다.

## 범위

- `scripts/status-workflow.sh`
- `scripts/test-harness.sh`
- `docs/11-git-sync-policy.md`
- workspace/report evidence

## 제외

- GitHub Project Status 자동보정
- PR merge/finalize/cleanup 실행
- 원격 issue 생성
- Notion sync 변경
