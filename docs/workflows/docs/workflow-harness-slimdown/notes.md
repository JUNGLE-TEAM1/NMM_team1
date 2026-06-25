# Workflow harness slimdown 노트

## 진행 메모

- 2026-06-25: 현재 worktree가 `hotfix/remote-reconciliation-auto-pr`이고 원격 branch가 gone 상태이며, 기존 `docs/workflows/hotfix/remote-reconciliation-auto-pr/sync.md` 수정이 있었다. 해당 변경을 보호하기 위해 branch 전환 없이 `--no-checkout --no-issue`로 workspace만 생성했다.
- 2026-06-25: `docs/08-development-workflow.md`에서 하위 정책 문서의 상세 반복을 줄이고 canonical 문서 참조로 정리했다.

## 결정

- 새 규칙은 추가하지 않고 역할 경계와 참조만 정리했다.
- 스크립트 동작 변경은 하지 않았다.

## 열린 질문

- 이 변경을 별도 PR로 올리려면 dirty hotfix workspace 변경과 분리된 branch 전환/commit 정리가 필요하다.

## 링크 / 증거

- `scripts/status-workflow.sh docs/workflows/docs/workflow-harness-slimdown`
