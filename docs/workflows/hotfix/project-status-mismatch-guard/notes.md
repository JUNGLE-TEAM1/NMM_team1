# Project status mismatch guard 노트

## 관찰

- Issue `#83`은 PR `#85` merge 후 `CLOSED`였고, 하네스 evidence에는 Project Status `Done` 설정 성공이 기록되어 있었다.
- 이후 PR `#99`가 닫힌 issue를 cross-reference한 직후 `github-project-automation[bot]`이 Project Status를 다시 변경했고, 현재 값은 `Ready`였다.
- 따라서 보강 방향은 자동보정이 아니라 lifecycle mismatch 탐지와 사람 승인형 정렬 안내가 맞다.

## 구현 메모

- `status-workflow.sh`는 GitHub CLI가 가능할 때 Project item list에서 linked issue의 Project Status를 읽는다.
- Project Status 조회 실패는 기존 status summary를 깨지 않도록 `not checked`로 남긴다.
- mismatch 조건은 `remote_pr_status == MERGED`, `remote_issue_status == CLOSED`, `remote_issue_project_status != Done`이다.
